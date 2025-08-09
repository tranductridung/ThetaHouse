import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class TransferItemDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  currentCustomerId: number;
}
