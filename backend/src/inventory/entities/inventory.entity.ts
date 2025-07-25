import { Product } from './../../product/entities/product.entity';
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
