import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ProductUnit } from 'src/common/enums/enum';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsEnum(ProductUnit)
  unit: ProductUnit;

  // @Type(() => Number)
  // @IsNumber({ maxDecimalPlaces: 2 })
  // @Min(0)
  // unitPrice: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  defaultOrderPrice: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  defaultPurchasePrice: number;
}
