import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { ConsignmentType } from 'src/common/enums/enum';
import { CreateItemDto } from 'src/item/dto/create-item.dto';

export class CreateConsignmentDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItemDto)
  items: CreateItemDto[];

  @IsEnum(ConsignmentType)
  type: ConsignmentType;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  @IsOptional()
  commissionRate: number;

  @IsString()
  @IsOptional()
  note?: string;

  @Type(() => Number)
  @IsPositive()
  @IsInt()
  partnerId: number;

  @Type(() => Number)
  @IsPositive()
  @IsInt()
  @IsOptional()
  payerId?: number;
}
