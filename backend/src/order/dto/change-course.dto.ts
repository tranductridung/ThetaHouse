import { Type } from 'class-transformer';
import { IsInt, IsPositive } from 'class-validator';

export class ChangeCourseDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  courseId: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  changeQuantity: number;
}
