import { Controller, Get, Param, Query } from "@nestjs/common";
import { ProviderType } from "@prisma/client";
import { ProvidersService } from "./providers.service";

@Controller("v1/providers")
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  // GET /v1/providers?type=RESTAURANT
  // Public catalog listing. Stable, identical shape for web + mobile.
  @Get()
  async list(@Query("type") type?: ProviderType) {
    const providers = await this.providersService.list(type);
    return { providers };
  }

  // GET /v1/providers/:id
  @Get(":id")
  async findOne(@Param("id") id: string) {
    const provider = await this.providersService.findOne(id);
    return { provider };
  }
}
