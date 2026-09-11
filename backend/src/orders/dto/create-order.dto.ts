import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsPositive,
  IsString,
  ValidateNested,
} from "class-validator";

export class OrderItemDto {
  @IsString()
  productId!: string;

  @IsInt()
  @IsPositive()
  quantity!: number;
}

// Mirrors the original CreateOrderSchema exactly:
// providerId: string, items: non-empty array of { productId, quantity: positive int }
export class CreateOrderDto {
  @IsString()
  providerId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}
