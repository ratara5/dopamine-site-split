import { Module } from "@nestjs/common";
import { InternalController } from "./internal.controller";
import { TrackingModule } from "../tracking/tracking.module";

@Module({
  imports: [TrackingModule],
  controllers: [InternalController],
})
export class InternalModule {}
