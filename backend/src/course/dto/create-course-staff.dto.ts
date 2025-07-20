import { Type } from 'class-transformer';
import { IsEnum, IsNumber } from 'class-validator';
import { CourseRole } from 'src/common/enums/enum';

export class CreateCourseStaffDto {
  @Type(() => Number)
  @IsNumber()
  courseId: number;

  @Type(() => Number)
  @IsNumber()
  staffId: number;

  @IsEnum(CourseRole)
  role: CourseRole;
}
