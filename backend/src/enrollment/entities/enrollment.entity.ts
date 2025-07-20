import { EnrollmentStatus } from 'src/common/enums/enum';
import { Course } from 'src/course/entities/course.entity';
import { Item } from 'src/item/entities/item.entity';
import { Partner } from 'src/partner/entities/partner.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Enrollment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  note?: string;

  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.PENDING,
  })
  status: EnrollmentStatus;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updated: Date;

  @ManyToOne(() => Course, (course) => course.enrollments, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @ManyToOne(() => Partner, (student) => student.enrollments, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'studentId' })
  student: Partner;

  @ManyToOne(() => Item, (item) => item.enrollments, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'itemId' })
  item: Item;
}
