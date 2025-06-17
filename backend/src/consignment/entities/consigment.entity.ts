import { ConsignmentType, SourceStatus } from 'src/common/enums/enum';
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
export class Consignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ConsignmentType })
  type: ConsignmentType;

  @Column('decimal', {
    precision: 5,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  commissionRate: number;

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

  @Column({ type: 'enum', enum: SourceStatus, default: SourceStatus.CONFIRMED })
  status: SourceStatus;

  @Column({ nullable: true })
  note?: string;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.consignments, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @ManyToOne(() => Partner, (partner) => partner.consignments, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'partnerId' })
  partner: Partner;
}
