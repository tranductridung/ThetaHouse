import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateItemDto } from 'src/item/dto/create-item.dto';

export class CreatePurchaseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItemDto)
  items: CreateItemDto[];

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  discountAmount?: number;

  @IsString()
  @IsOptional()
  note?: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  supplierId: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  payerId: number;
}
