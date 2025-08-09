import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class UpdateItemDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  quantity?: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  discountId?: number;
}
