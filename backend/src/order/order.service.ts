import { Order } from './entities/order.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ItemService } from 'src/item/item.service';
import { User } from 'src/user/entities/user.entity';
import { Item } from 'src/item/entities/item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Product } from 'src/product/entities/product.entity';
import { Partner } from 'src/partner/entities/partner.entity';
import { Discount } from 'src/discount/entities/discount.entity';
import { InventoryService } from 'src/inventory/inventory.service';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { TransactionService } from 'src/transaction/transaction.service';
import { CreateTransactionDto } from 'src/transaction/dto/create-transaction.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CommonStatus,
  ItemableType,
  ItemStatus,
  PartnerType,
  SourceType,
  TransactionType,
} from 'src/common/enums/enum';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    private itemService: ItemService,
    private inventoryService: InventoryService,
    private transactionService: TransactionService,
    private dataSource: DataSource,
  ) {}

  async create(createOrderDto: CreateOrderDto, creatorId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const order = queryRunner.manager.create(Order, {
      ...createOrderDto,
      quantity: 0,
      totalAmount: 0,
      finalAmount: 0,
    });
    order.creator = await queryRunner.manager.findOneByOrFail(User, {
      id: creatorId,
    });

    order.customer = await queryRunner.manager.findOneByOrFail(Partner, {
      id: createOrderDto.customerId,
      type: PartnerType.CUSTOMER,
    });

    if (createOrderDto.discountId)
      order.discount = await queryRunner.manager.findOneOrFail(Discount, {
        where: {
          id: createOrderDto.discountId,
          status: CommonStatus.ACTIVE,
        },
      });

    await queryRunner.manager.save(order);

    let totalAmount = 0;
    let orderQuantity = 0;
    try {
      for (const item of createOrderDto.items) {
        const itemResult = await this.itemService.add(
          item,
          order.id,
          SourceType.ORDER,
          queryRunner.manager,
        );
        totalAmount += itemResult.finalAmount;
        orderQuantity += itemResult.quantity;
      }

      // Update quantity and reversed of product
      const itemResults = await queryRunner.manager.find(Item, {
        where: {
          sourceId: order.id,
          sourceType: SourceType.ORDER,
        },
      });

      for (const itemResult of itemResults) {
        if (itemResult.itemableType === ItemableType.PRODUCT) {
          const product = await queryRunner.manager.findOneByOrFail(Product, {
            id: itemResult.itemableId,
          });

          // Quantity of product is not enough
          if (product.quantity < itemResult.quantity) {
            throw new BadRequestException(
              'Not enough stock for product ' + product.id,
            );
          }

          // Update quantity and reversed of product
          product.quantity -= itemResult.quantity;
          product.reserved += itemResult.quantity;
          await queryRunner.manager.save(product);
        }
      }

      const finalAmount = await this.itemService.calculateDiscountAmount(
        totalAmount,
        createOrderDto.discountId,
      );

      queryRunner.manager.merge(Order, order, {
        quantity: orderQuantity,
        totalAmount,
        finalAmount,
      });
      await queryRunner.manager.save(order);

      // Create transaction
      const createTransactionDto: CreateTransactionDto = {
        type: TransactionType.INCOME,
        sourceType: SourceType.ORDER,
        sourceId: order.id,
        totalAmount: finalAmount,
        note: `Transaction of order ${order.id}`,
      };

      await this.transactionService.create(
        createTransactionDto,
        creatorId,
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();
      return order;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return await this.orderRepo.find();
  }

  async findOne(id: number) {
    const order = await this.orderRepo.findOneBy({ id });

    if (!order) throw new NotFoundException('Order not found!');

    return order;
  }

  async findOneFull(id: number) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['creator', 'customer', 'discount'],
    });

    if (!order) throw new NotFoundException('Order not found!');

    const items = await this.itemService.findItemsBySource(
      order.id,
      SourceType.ORDER,
    );

    return { ...order, items: items };
  }

  async exportItem(itemId: number, creatorId: number) {
    const item = await this.itemService.findItem(itemId, ItemableType.PRODUCT);

    if (!item) throw new NotFoundException('Item not found!');

    if (item.status !== ItemStatus.NONE)
      throw new BadRequestException(`Item is ${item.status}!`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const inventory = await this.inventoryService.createInventoryForItem(
        item,
        creatorId,
        queryRunner.manager,
      );

      item.status = ItemStatus.EXPORTED;
      await queryRunner.manager.save(item);

      await queryRunner.commitTransaction();
      return inventory;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async exportOrder(orderId: number, creatorId: number) {
    const order = await this.findOneFull(orderId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // Find list item which is not exported/imported
    const itemsNotExported = await this.itemService.findItemsBySource(
      order.id,
      SourceType.ORDER,
      ItemableType.PRODUCT,
      ItemStatus.NONE,
    );

    if (itemsNotExported.length === 0)
      return { message: 'All item of order is exported!' };

    const itemInventories: Inventory[] = [];

    try {
      for (const item of itemsNotExported) {
        const itemInventory =
          await this.inventoryService.createInventoryForItem(
            item,
            creatorId,
            queryRunner.manager,
          );

        item.status = ItemStatus.EXPORTED;
        await queryRunner.manager.save(item);

        if (itemInventory) {
          itemInventory.item = item;
          itemInventories.push(itemInventory);
        }
      }

      await queryRunner.commitTransaction();

      return { itemInventories };
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
