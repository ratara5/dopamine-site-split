import { Injectable, NotFoundException } from "@nestjs/common";
import { ProviderType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ProvidersService {
  constructor(private readonly prisma: PrismaService) {}

  // Byte-equivalent to the original GET /api/v1/providers handler.
  async list(type?: ProviderType) {
    return this.prisma.provider.findMany({
      where: type ? { type } : undefined,
      orderBy: { ratingAvg: "desc" },
      select: {
        id: true,
        name: true,
        type: true,
        logoUrl: true,
        bannerUrl: true,
        ratingAvg: true,
        etaMinutes: true,
      },
    });
  }

  // Byte-equivalent to the original GET /api/v1/providers/:id handler.
  async findOne(id: string) {
    const provider = await this.prisma.provider.findUnique({
      where: { id },
      include: {
        categories: {
          include: { products: true },
        },
      },
    });

    if (!provider) {
      throw new NotFoundException("Provider not found");
    }

    return provider;
  }
}
