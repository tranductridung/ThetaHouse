import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { InventoryAction } from 'src/common/enums/enum';

export class CreateItemInventoryDto {
  @IsEnum(InventoryAction)
  action: InventoryAction;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity: number;

  @IsString()
  @IsOptional()
  note?: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  productId: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  itemId: number;
}
