import { Controller, Get, Param } from "@nestjs/common";
import { ProductsService } from "./products.service";

@Controller("v1/products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // GET /v1/products/:id
  @Get(":id")
  async findOne(@Param("id") id: string) {
    const product = await this.productsService.findOne(id);
    return { product };
  }
}
