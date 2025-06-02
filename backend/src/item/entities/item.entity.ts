import { Appointment } from 'src/appointment/entities/appointment.entity';
import {
  AdjustmentType,
  ItemableType,
  ItemStatus,
  SourceType,
} from 'src/common/enums/enum';
import { Discount } from 'src/discount/entities/discount.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sourceId: number;

  @Column({ type: 'enum', enum: SourceType })
  sourceType: SourceType;

  @Column()
  itemableId: number;

  @Column({ type: 'enum', enum: ItemableType })
  itemableType: ItemableType;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  finalAmount: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'enum', enum: AdjustmentType, default: AdjustmentType.INIT })
  adjustmentType: AdjustmentType;

  @Column({ type: 'json' })
  snapshotData: any;

  @Column({ type: 'enum', enum: ItemStatus, default: ItemStatus.NONE })
  status: ItemStatus;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;

  @ManyToOne(() => Discount, (discount) => discount.items, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'discountId' })
  discount: Discount;

  @OneToMany(() => Inventory, (inventories) => inventories.item)
  inventories: Inventory[];

  @OneToMany(() => Appointment, (appointment) => appointment.item)
  appointments: Appointment[];
}
