import { ConsigmentType } from 'src/common/enums/enum';
import { Partner } from 'src/partner/entities/partner.entity';
import { User } from 'src/user/entities/user.entity';
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
export class Consigment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ConsigmentType })
  type: ConsigmentType;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  commissionRate: number;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 12, scale: 2 })
  totalAmount: number;

  @Column('decimal', { precision: 12, scale: 2 })
  finalAmount: number;

  @Column({ nullable: true })
  note?: string;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.consigments, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @ManyToOne(() => Partner, (partner) => partner.consigments, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'partnerId' })
  partner: Partner;
}
