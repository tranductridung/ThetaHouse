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
import { PaymentMethod } from 'src/common/enums/enum';

export class CreatePaymentDto {
  @Type(() => Number)
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsString()
  @IsOptional()
  note?: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  transactionId: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  customerId: number;
}
