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
import { ServiceType } from 'src/common/enums/enum';

export class CreateServiceDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  duration: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitPrice: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  session: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  bonusSession?: number;

  @IsEnum(ServiceType)
  type: ServiceType;
}
