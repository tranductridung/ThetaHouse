import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { AppointmentType } from 'src/common/enums/enum';

export class CreateAppointmentDto {
  @IsString()
  @IsOptional()
  note?: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  itemId?: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  customerId: number;

  @IsEnum(AppointmentType)
  type: AppointmentType;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startAt?: Date;

  // @Type(() => Number)
  // @IsNumber()
  // @IsPositive()
  // duration?: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  healerId?: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  roomId?: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  moduleIds?: number[];
}
