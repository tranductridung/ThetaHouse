import { PaymentMethod } from 'src/common/enums/enum';
import { ColumnNumericTransformer } from 'src/common/transformers/column-numeric.transformer';
import { Partner } from 'src/partner/entities/partner.entity';
import { Transaction } from 'src/transaction/entities/transaction.entity';
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
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', {
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  amount: number;

  @Column({ type: 'enum', enum: PaymentMethod })
  method: PaymentMethod;

  @Column('text', { nullable: true })
  note?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Transaction, (transaction) => transaction.payments, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'transactionId' })
  transaction: Transaction;

  @ManyToOne(() => User, (creator) => creator.payments, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @ManyToOne(() => Partner, (partner) => partner.payments, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'partnerId' })
  partner: Partner;
}
