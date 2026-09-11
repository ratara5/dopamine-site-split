import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { SessionUser } from "../auth/auth.service";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";

@Controller("v1/orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // POST /v1/orders — the only order endpoint that requires auth in
  // the original app, so it's the only one guarded here too.
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  async create(@CurrentUser() user: SessionUser, @Body() dto: CreateOrderDto) {
    const order = await this.ordersService.create(user.id, dto);
    return { order };
  }

  // GET /v1/orders/:id — intentionally unguarded, matching the
  // original (see OrdersService.findOne for the caveat).
  @Get(":id")
  async findOne(@Param("id") id: string) {
    const order = await this.ordersService.findOne(id);
    return { order };
  }

  // GET /v1/orders/:id/tracking — intentionally unguarded, matching
  // the original. Polled every 2.5s by the frontend while an order is
  // in flight.
  @Get(":id/tracking")
  async tracking(@Param("id") id: string) {
    return this.ordersService.tracking(id);
  }
}
