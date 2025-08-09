import { Type } from 'class-transformer';
import { IsDate, IsInt, IsPositive, IsString } from 'class-validator';

export class CreateCalendarDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  userId: number;

  @IsString()
  summary: string;

  @IsString()
  description: string;

  @Type(() => Date)
  @IsDate()
  startDateTime: Date;

  @Type(() => Date)
  @IsDate()
  endDateTime: Date;
}
