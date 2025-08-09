import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { CourseMode } from 'src/common/enums/enum';

export class CreateCourseDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  onlineSession?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  offlineSession?: number;

  @IsEnum(CourseMode)
  mode: CourseMode;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxStudent: number;

  @IsString()
  @IsOptional()
  meetingLink: string;

  @IsString()
  @IsOptional()
  meetingPassword: string;
}
