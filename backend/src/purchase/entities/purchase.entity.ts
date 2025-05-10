import { DiscountType } from 'src/common/enums/enum';
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
export class Purchase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 12, scale: 2 })
  totalAmount: number;

  @Column('decimal', { precision: 12, scale: 2 })
  finalAmount: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ nullable: true })
  note?: string;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;

  @ManyToOne(() => Partner, (partner) => partner.purchases, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'supplierId' })
  supplier: Partner;

  @ManyToOne(() => User, (user) => user.purchases, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'creatorId' })
  creator: User;
}
