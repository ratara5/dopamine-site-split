import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrderDto } from "./dto/create-order.dto";

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  // Byte-equivalent to the original POST /api/v1/orders handler.
  // No payment provider is ever called from this file or anywhere in
  // this codebase. The "total" is display-only, used later to compute
  // the "money saved" payoff message.
  async create(userId: string, dto: CreateOrderDto) {
    const { providerId, items } = dto;

    const products = await this.prisma.product.findMany({
      where: { id: { in: items.map((i) => i.productId) } },
    });

    const totalCents = items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      return sum + (product?.priceCents ?? 0) * item.quantity;
    }, 0);

    const order = await this.prisma.order.create({
      data: {
        userId,
        providerId,
        totalCents,
        status: "PLACED",
        items: {
          create: items.map((item) => {
            const product = products.find((p) => p.id === item.productId)!;
            return {
              productId: item.productId,
              quantity: item.quantity,
              priceCentsAtOrder: product.priceCents,
            };
          }),
        },
        // Seed the first tracking point immediately so the UI has
        // something to render before the worker's first tick.
        tracking: {
          create: { lat: 4.65, lng: -74.06, sequence: 0 },
        },
      },
      include: { items: true, tracking: true },
    });

    return order;
  }

  // Byte-equivalent to the original GET /api/v1/orders/:id handler.
  //
  // ⚠️ PRESERVED AS-IS FROM THE ORIGINAL: this endpoint has no
  // ownership check — any caller who knows (or guesses/enumerates) an
  // order id can read it, authenticated or not. That was already true
  // in the monolith. It's called out explicitly in
  // MIGRATION_NOTES.md because this endpoint is about to be exposed
  // to a public mobile client too, which raises the stakes. Fixing it
  // was out of scope for "port as-is, no behavior changes" — flag for
  // a follow-up ticket.
  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        savings: true,
      },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    return order;
  }

  // Byte-equivalent to the original GET /api/v1/orders/:id/tracking
  // handler. Same missing-ownership-check caveat as findOne() above.
  async tracking(id: string) {
    const points = await this.prisma.trackingPoint.findMany({
      where: { orderId: id },
      orderBy: { sequence: "asc" },
    });

    const order = await this.prisma.order.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    return { status: order.status, points };
  }
}
