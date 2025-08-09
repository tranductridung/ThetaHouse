import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateConsultationAppointmentDto {
  @IsString()
  @IsOptional()
  note?: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  customerId: number;

  @Type(() => Date)
  @IsDate()
  startAt: Date;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  duration: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  healerId: number;
}
