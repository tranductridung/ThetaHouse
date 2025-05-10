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
import { ConsigmentType } from 'src/common/enums/enum';
import { CreateItemDto } from 'src/item/dto/create-item.dto';

export class CreateConsigmentDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItemDto)
  items: CreateItemDto[];

  @IsEnum(ConsigmentType)
  type: ConsigmentType;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  commissionRate: number;

  @IsString()
  @IsOptional()
  note?: string;

  @Type(() => Number)
  @IsPositive()
  @IsInt()
  partnerId: number;
}
