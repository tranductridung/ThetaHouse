import { CourseRole } from 'src/common/enums/enum';
import { Course } from 'src/course/entities/course.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class CourseStaff {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: CourseRole, default: CourseRole.TRAINER })
  role: CourseRole;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;

  @ManyToOne(() => Course, (course) => course.courseStaffs, {
    onDelete: 'RESTRICT',
  })
  course: Course;

  @ManyToOne(() => User, (staff) => staff.courseStaffs, {
    onDelete: 'RESTRICT',
  })
  staff: User;
}
