import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateItemDto } from 'src/item/dto/create-item.dto';

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItemDto)
  items: CreateItemDto[];

  @IsString()
  @IsOptional()
  note: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  discountId: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  customerId: number;
}
