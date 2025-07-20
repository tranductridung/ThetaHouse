import { CommonStatus, CourseMode } from 'src/common/enums/enum';
import { ColumnNumericTransformer } from 'src/common/transformers/column-numeric.transformer';
import { CourseStaff } from 'src/course/entities/course-staff.entity';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('decimal', {
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  price: number;

  @Column({ type: 'int', nullable: true })
  onlineSession?: number | null;

  @Column({ type: 'int', nullable: true })
  offlineSession?: number | null;

  @Column({ type: 'enum', enum: CourseMode, default: CourseMode.OFFLINE })
  mode: CourseMode;

  @Column()
  startDate: Date;

  @Column({ type: 'enum', enum: CommonStatus, default: CommonStatus.ACTIVE })
  status: CommonStatus;

  @Column()
  maxStudent: number;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;

  @OneToMany(() => CourseStaff, (cs) => cs.course)
  courseStaffs: CourseStaff[];

  @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
  enrollments: Enrollment[];
}
