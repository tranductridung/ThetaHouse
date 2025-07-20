import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateEnrollmentDto {
  @IsString()
  @IsOptional()
  note?: string;

  @Type(() => Number)
  @IsNumber()
  courseId: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  studentId?: number;

  @Type(() => Number)
  @IsNumber()
  itemId: number;
}
