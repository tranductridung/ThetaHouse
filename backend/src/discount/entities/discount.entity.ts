import { CommonStatus, DiscountType } from 'src/common/enums/enum';
import { Item } from 'src/item/entities/item.entity';
import { Order } from 'src/order/entities/order.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Discount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('decimal', { precision: 12, scale: 2 })
  value: number;

  @Column({ type: 'enum', enum: DiscountType })
  type: DiscountType;

  @Column('decimal', { nullable: true, precision: 12, scale: 2 })
  maxDiscountAmount?: number;

  @Column('decimal', { nullable: true, precision: 12, scale: 2 })
  minTotalValue?: number;

  @Column({ type: 'enum', enum: CommonStatus, default: CommonStatus.ACTIVE })
  status: CommonStatus;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;

  @OneToMany(() => Order, (order) => order.discount)
  orders: Order[];

  @OneToMany(() => Item, (item) => item.discount)
  items: Item[];
}
