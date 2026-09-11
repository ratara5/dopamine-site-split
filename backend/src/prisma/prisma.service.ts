import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

// Same Prisma schema, same Postgres database as the original monolith.
// Nest's DI takes care of the singleton lifecycle that the old
// lib/prisma.ts globalThis hack existed to work around in Next.js dev
// hot-reload — that hack is no longer needed here.
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
