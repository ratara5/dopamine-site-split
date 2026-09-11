"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let OrdersService = class OrdersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
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
                        const product = products.find((p) => p.id === item.productId);
                        return {
                            productId: item.productId,
                            quantity: item.quantity,
                            priceCentsAtOrder: product.priceCents,
                        };
                    }),
                },
                tracking: {
                    create: { lat: 4.65, lng: -74.06, sequence: 0 },
                },
            },
            include: { items: true, tracking: true },
        });
        return order;
    }
    async findOne(id) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                items: { include: { product: true } },
                savings: true,
            },
        });
        if (!order) {
            throw new common_1.NotFoundException("Order not found");
        }
        return order;
    }
    async tracking(id) {
        const points = await this.prisma.trackingPoint.findMany({
            where: { orderId: id },
            orderBy: { sequence: "asc" },
        });
        const order = await this.prisma.order.findUnique({
            where: { id },
            select: { status: true },
        });
        if (!order) {
            throw new common_1.NotFoundException("Order not found");
        }
        return { status: order.status, points };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map