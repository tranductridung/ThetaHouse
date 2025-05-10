import { CommonStatus, ServiceType } from 'src/common/enums/enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column()
  duration: number;

  @Column('decimal', { precision: 12, scale: 2 })
  unitPrice: number;

  @Column({ type: 'enum', enum: CommonStatus, default: CommonStatus.ACTIVE })
  status: CommonStatus;

  @Column({ default: 1 })
  session: number;

  @Column({ default: 0 })
  bonusSession: number;

  @Column({ type: 'enum', enum: ServiceType })
  type: ServiceType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
