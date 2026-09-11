import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  // Byte-equivalent to the original GET /api/v1/products/:id handler,
  // including the reviews cap: latest 20, newest first. Note this
  // means the frontend's product page (which previously fetched ALL
  // reviews directly via Prisma with no limit) now sees at most 20 —
  // see MIGRATION_NOTES.md for why this was kept as-is rather than
  // widened.
  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        provider: true,
        reviews: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    return product;
  }
}
