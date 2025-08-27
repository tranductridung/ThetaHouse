import { ColumnNumericTransformer } from 'src/common/transformers/column-numeric.transformer';
import { InventoryAction } from 'src/common/enums/enum';
import { Item } from 'src/item/entities/item.entity';
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
import { Product } from 'src/product/entities/product.entity';

@Entity()
export class Inventory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: InventoryAction })
  action: InventoryAction;

  @Column()
  quantity: number;

  @Column('text', { nullable: true })
  note?: string;

  // Order and Purchase price for 1 base quantity
  @Column('decimal', {
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  unitPrice: number;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;

  @ManyToOne(() => Product, (product) => product.inventories, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne(() => User, (user) => user.inventories, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @ManyToOne(() => Item, (item) => item.inventories, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'itemId' })
  item: Item;
}
