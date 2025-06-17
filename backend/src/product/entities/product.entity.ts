import { CommonStatus, ProductUnit } from 'src/common/enums/enum';
import { ColumnNumericTransformer } from 'src/common/transformers/column-numeric.transformer';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: ProductUnit })
  unit: ProductUnit;

  @Column('decimal', {
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  unitPrice: number;

  @Column({ default: 0 })
  quantity: number;

  @Column({ default: 0 })
  reserved: number;

  @Column({ type: 'enum', enum: CommonStatus, default: CommonStatus.ACTIVE })
  status: CommonStatus;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;

  @OneToMany(() => Inventory, (inventories) => inventories.product)
  inventories: Inventory[];
}
