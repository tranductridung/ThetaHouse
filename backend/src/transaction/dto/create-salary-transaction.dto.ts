import { IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSalaryTransactionDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  healerId: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  month: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  year: number;
}
