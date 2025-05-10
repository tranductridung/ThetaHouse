import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { DiscountType } from 'src/common/enums/enum';

export class CreateDiscountDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsString()
  @IsOptional()
  description: string;

  @Type(() => Number)
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  value: number;

  @IsEnum(DiscountType)
  type: DiscountType;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  maxDiscountAmount: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  minTotalValue: number;
}
