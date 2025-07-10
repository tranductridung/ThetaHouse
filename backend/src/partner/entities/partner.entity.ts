import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { PartnerType, SexType } from 'src/common/enums/enum';
import { Order } from 'src/order/entities/order.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { Purchase } from 'src/purchase/entities/purchase.entity';
import { Consignment } from 'src/consignment/entities/consigment.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';

@Entity()
export class Partner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  fullName?: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  note?: string;

  @Column({ type: 'enum', enum: PartnerType })
  type: PartnerType;

  @Column({ nullable: true })
  dob?: Date;

  @Column({ type: 'enum', enum: SexType, default: SexType.UNDEFINED })
  sex: SexType;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;

  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];

  @OneToMany(() => Purchase, (purchase) => purchase.supplier)
  purchases: Purchase[];

  @OneToMany(() => Consignment, (consignment) => consignment.creator)
  consignments: Consignment[];

  @OneToMany(() => Appointment, (appointment) => appointment.customer)
  appointments: Appointment[];

  @OneToMany(() => Payment, (payments) => payments.partner)
  payments: Payment[];
}
