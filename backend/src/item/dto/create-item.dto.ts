import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';
import { ItemableType } from 'src/common/enums/enum';

export class CreateItemDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  itemableId: number;

  @IsEnum(ItemableType)
  itemableType: ItemableType;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  quantity: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  discountId: number;
}
