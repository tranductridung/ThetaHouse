import { Module } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentController } from './enrollment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { CourseModule } from 'src/course/course.module';
import { PartnerModule } from 'src/partner/partner.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Enrollment]),
    CourseModule,
    PartnerModule,
  ],
  controllers: [EnrollmentController],
  providers: [EnrollmentService],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}
