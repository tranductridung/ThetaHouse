import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateEnrollmentDto {
  @IsString()
  @IsOptional()
  note?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  studentId?: number;
}
