import { Transaction } from './../../transaction/entities/transaction.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { IsEnum } from 'class-validator';
import { Item } from 'src/item/entities/item.entity';
import { Order } from 'src/order/entities/order.entity';
import { Token } from 'src/token/entities/token.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { UserStatus, SexType } from '../../common/enums/enum';
import { Purchase } from 'src/purchase/entities/purchase.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { UserRole } from 'src/authorization/entities/user-role.entity';
import { CourseStaff } from '../../course/entities/course-staff.entity';
import { Consignment } from 'src/consignment/entities/consigment.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ type: 'enum', enum: UserStatus, default: [UserStatus.UNVERIFIED] })
  @IsEnum(UserStatus)
  status: UserStatus;

  @Column({ select: false })
  password: string;

  @Column({ type: 'text', nullable: true, select: false })
  googleAccessToken?: string | null;

  @Column({ type: 'text', nullable: true, select: false })
  googleRefreshToken?: string | null;

  @Column({ type: 'enum', enum: SexType, default: SexType.UNDEFINED })
  sex: SexType;

  @Column({ nullable: true })
  dob: Date;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;

  @OneToMany(() => Inventory, (inventories) => inventories.creator)
  inventories: Inventory[];

  @OneToMany(() => Consignment, (consignments) => consignments.creator)
  consignments: Consignment[];

  @OneToMany(() => Order, (orders) => orders.creator)
  orders: Order[];

  @OneToMany(() => Purchase, (purchases) => purchases.creator)
  purchases: Purchase[];

  @OneToMany(() => Appointment, (appointments) => appointments.healer)
  appointments: Appointment[];

  @OneToMany(() => Transaction, (transaction) => transaction.creator)
  createdTransactions: Transaction[];

  @OneToMany(() => Transaction, (transaction) => transaction.healer)
  healerSalaryTransactions: Transaction[];

  @OneToMany(() => Payment, (payments) => payments.creator)
  payments: Payment[];

  @OneToMany(() => CourseStaff, (cs) => cs.staff)
  courseStaffs: CourseStaff[];

  @OneToMany(() => Token, (tokens) => tokens.user)
  tokens: Token[];

  @OneToMany(() => Item, (items) => items.creator)
  items: Item[];

  @OneToMany(() => UserRole, (ur) => ur.user)
  userRoles: UserRole[];
}
