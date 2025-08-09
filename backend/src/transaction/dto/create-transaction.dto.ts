import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { PayerType, SourceType, TransactionType } from 'src/common/enums/enum';

export class CreateTransactionDto {
  @IsEnum(TransactionType)
  type: TransactionType;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  sourceId: number;

  @IsEnum(SourceType)
  sourceType: SourceType;

  @IsEnum(PayerType)
  payerType: PayerType;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  payerId: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  totalAmount: number;

  @IsString()
  @IsOptional()
  note?: string;
}
