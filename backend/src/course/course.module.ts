import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { UserModule } from 'src/user/user.module';
import { CourseStaff } from './entities/course-staff.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, CourseStaff]), UserModule],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService],
})
export class CourseModule {}
