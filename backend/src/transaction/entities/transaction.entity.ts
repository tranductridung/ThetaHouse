import {
  PayerType,
  SourceType,
  TransactionStatus,
  TransactionType,
} from 'src/common/enums/enum';
import { ColumnNumericTransformer } from 'src/common/transformers/column-numeric.transformer';
import { Payment } from 'src/payment/entities/payment.entity';
import { User } from 'src/user/entities/user.entity';
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
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'enum', enum: SourceType, nullable: true })
  sourceType: SourceType;

  @Column({ nullable: true })
  sourceId: number;

  @Column({ type: 'enum', enum: PayerType, nullable: true })
  payerType: PayerType;

  @Column({ nullable: true })
  payerId: number;

  @Column('decimal', {
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  totalAmount: number;

  @Column('decimal', {
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  paidAmount: number;

  @Column({ nullable: true })
  month?: number;

  @Column({ nullable: true })
  year?: number;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.UNPAID,
  })
  status: TransactionStatus;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.createdTransactions, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @ManyToOne(() => User, (user) => user.healerSalaryTransactions, {
    nullable: true,
  })
  @JoinColumn({ name: 'healerId' })
  healer: User;

  @OneToMany(() => Payment, (payments) => payments.transaction)
  payments: Payment[];
}
