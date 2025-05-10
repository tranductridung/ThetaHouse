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
import { SourceType, TransactionType } from 'src/common/enums/enum';

export class CreateTransactionDto {
  @IsEnum(TransactionType)
  type: TransactionType;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  sourceId: number;

  @IsEnum(SourceType)
  sourceType: SourceType;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  totalAmount: number;

  @IsString()
  @IsOptional()
  note: string;
}
