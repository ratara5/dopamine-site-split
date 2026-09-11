import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { advanceAllActiveOrders } from "./simulate-tracking";

@Injectable()
export class TrackingService {
  constructor(private readonly prisma: PrismaService) {}

  async advanceAllActiveOrders() {
    return advanceAllActiveOrders(this.prisma);
  }
}
