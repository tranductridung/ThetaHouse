import { SourceStatus } from 'src/common/enums/enum';
import { ColumnNumericTransformer } from 'src/common/transformers/column-numeric.transformer';
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
  finalAmount: number;

  @Column('decimal', {
    precision: 12,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  discountAmount: number;

  @Column({ type: 'enum', enum: SourceStatus, default: SourceStatus.CONFIRMED })
  status: SourceStatus;

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
