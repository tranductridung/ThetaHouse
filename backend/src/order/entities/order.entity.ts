import { SourceStatus } from 'src/common/enums/enum';
import { Discount } from 'src/discount/entities/discount.entity';
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
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 12, scale: 2 })
  totalAmount: number;

  @Column('decimal', { precision: 12, scale: 2 })
  finalAmount: number;

  @Column({ nullable: true })
  note?: string;

  @Column({ type: 'enum', enum: SourceStatus, default: SourceStatus.CONFIRMED })
  status: SourceStatus;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;

  @ManyToOne(() => Discount, (discount) => discount.orders, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'discountId' })
  discount: Discount;

  @ManyToOne(() => Partner, (partner) => partner.orders, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'customerId' })
  customer: Partner;

  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'creatorId' })
  creator: User;
}
