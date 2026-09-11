import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { ProvidersModule } from "./providers/providers.module";
import { ProductsModule } from "./products/products.module";
import { OrdersModule } from "./orders/orders.module";
import { InternalModule } from "./internal/internal.module";
import { TrackingModule } from "./tracking/tracking.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ProvidersModule,
    ProductsModule,
    OrdersModule,
    TrackingModule,
    InternalModule,
  ],
})
export class AppModule {}
