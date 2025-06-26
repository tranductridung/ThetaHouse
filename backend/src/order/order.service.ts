import { PaginationDto } from './../common/dtos/pagination.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AdjustmentType,
  AppointmentStatus,
  CommonStatus,
  InventoryAction,
  ItemableType,
  ItemStatus,
  PartnerType,
  SourceStatus,
  SourceType,
  TransactionType,
} from 'src/common/enums/enum';
import { Order } from './entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ItemService } from 'src/item/item.service';
import { User } from 'src/user/entities/user.entity';
import { Item } from 'src/item/entities/item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateItemDto } from './../item/dto/create-item.dto';
import { Product } from 'src/product/entities/product.entity';
import { Partner } from 'src/partner/entities/partner.entity';
import { Discount } from 'src/discount/entities/discount.entity';
import { InventoryService } from 'src/inventory/inventory.service';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { DataSource, EntityManager, Not, Repository } from 'typeorm';
import { TransactionService } from 'src/transaction/transaction.service';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { CreateTransactionDto } from 'src/transaction/dto/create-transaction.dto';
import { CreateTransactionNoSourceDto } from 'src/transaction/dto/create-transaction-no-source.dto';

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
    console.log('createOrderDto', createOrderDto);

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

    // Calculate amount
    let totalAmount = 0;
    let orderQuantity = 0;
    try {
      for (const item of createOrderDto.items) {
        const itemResult = await this.itemService.add(
          item,
          order.id,
          SourceType.ORDER,
          queryRunner.manager,
          undefined,
        );
        totalAmount += itemResult.finalAmount;
        orderQuantity += itemResult.quantity;
      }

      // Update quantity and reversed of product
      const itemResults = await queryRunner.manager.find(Item, {
        where: {
          sourceId: order.id,
          sourceType: SourceType.ORDER,
          isActive: true,
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
              'Not enough stock for product number ' + product.id,
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
        note: `Transaction of order ${order.id}!`,
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

  async findAll(paginationDto?: PaginationDto) {
    const queryBuilder = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.creator', 'creator')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.discount', 'discount')
      .select([
        'order.id',
        'order.quantity',
        'order.totalAmount',
        'order.status',
        'order.finalAmount',
        'order.note',
        'creator.fullName',
        'customer.fullName',
        'discount.code',
      ])
      .orderBy('order.id', 'ASC');

    if (paginationDto) {
      const { page, limit } = paginationDto;

      const [orders, total] = await queryBuilder
        .skip(page * limit)
        .take(limit)
        .getManyAndCount();

      return { orders, total };
    } else {
      const orders = await queryBuilder.getMany();
      return orders;
    }
  }

  async findAllActive(paginationDto?: PaginationDto) {
    const queryBuilder = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.creator', 'creator')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.discount', 'discount')
      .where('order.status != :status', { status: SourceStatus.CANCELLED })
      .select([
        'order.id',
        'order.quantity',
        'order.totalAmount',
        'order.finalAmount',
        'order.status',
        'order.note',
        'creator.fullName',
        'customer.fullName',
        'discount.code',
      ])
      .orderBy('order.id', 'ASC');

    if (paginationDto) {
      const { page, limit } = paginationDto;

      const [orders, total] = await queryBuilder
        .skip(page * limit)
        .take(limit)
        .getManyAndCount();

      return { orders, total };
    } else {
      const orders = await queryBuilder.getMany();
      return orders;
    }
  }

  // The isActive parameter is used to check whether the order is cancelled or not.
  // If isActive is not used, the function will retrieve the order without checking its active status.
  async findOne(id: number, checkActive?: boolean, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Order) : this.orderRepo;

    const order = await repo.findOneBy({ id });

    if (!order) throw new NotFoundException('Order not found!');

    if (checkActive && order.status === SourceStatus.CANCELLED)
      throw new NotFoundException('Order is cancelled!');

    return order;
  }

  // The isActive parameter is used to check whether the order is cancelled or not.
  // If isActive is not used, the function will retrieve the order without checking its active status.
  async findOneFull(id: number, isActive?: boolean) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['creator', 'customer', 'discount'],
    });

    if (!order) throw new NotFoundException('Order not found!');

    if (isActive && order.status === SourceStatus.CANCELLED)
      throw new NotFoundException('Order is cancelled!');

    const items = await this.itemService.findItemsBySource(
      order.id,
      SourceType.ORDER,
      undefined,
      undefined,
      isActive ? true : undefined,
    );
    return { ...order, items: items };
  }

  async exportItem(itemId: number, creatorId: number, quantity?: number) {
    const item = await this.itemService.findItem(
      itemId,
      ItemableType.PRODUCT,
      undefined,
      true,
    );

    if (!item) throw new NotFoundException('Item not found!');

    if (item.status === ItemStatus.EXPORTED)
      throw new BadRequestException('Item is exported!');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const inventory = await this.inventoryService.createInventoryForItem(
        item,
        creatorId,
        queryRunner.manager,
        quantity,
      );

      await this.itemService.updateSourceStatus(
        item.sourceId,
        SourceType.ORDER,
        queryRunner.manager,
      );

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
    const order = await this.findOneFull(orderId, true);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // Find list item which is not exported/imported
    const itemsNotExported = await this.itemService.findItemsBySource(
      order.id,
      SourceType.ORDER,
      ItemableType.PRODUCT,
      [ItemStatus.NONE, ItemStatus.PARTIAL],
      true,
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

        await queryRunner.manager.save(item);

        if (itemInventory) {
          itemInventory.item = item;
          itemInventories.push(itemInventory);
        }
      }

      const orderStatus = await this.itemService.getSourceStatus(
        orderId,
        SourceType.ORDER,
        queryRunner.manager,
      );
      order.status = orderStatus;
      await queryRunner.manager.save(order);

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

  async cancelOrder(orderId: number, creatorId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // Load order
    const order = await this.findOne(orderId, true, queryRunner.manager);

    // Load active items of order
    const items = await queryRunner.manager.find(Item, {
      where: {
        sourceId: orderId,
        sourceType: SourceType.ORDER,
        isActive: true,
      },
    });

    try {
      // Note all inventory, transaction
      // Create transaction to refund
      const oldTransaction = await queryRunner.manager.findOneOrFail(
        Transaction,
        {
          where: {
            sourceType: SourceType.ORDER,
            sourceId: orderId,
          },
          select: ['id', 'paidAmount'],
        },
      );

      const createTransactionNoSourceDto: CreateTransactionNoSourceDto = {
        type: TransactionType.EXPENSE,
        totalAmount: oldTransaction.paidAmount,
        paidAmount: 0,
        note: `Refund for order #${order.id}`,
      };

      await this.transactionService.createNoSource(
        createTransactionNoSourceDto,
        creatorId,
        queryRunner.manager,
      );

      for (const item of items) {
        if (item.itemableType === ItemableType.PRODUCT) {
          if ([ItemStatus.NONE, ItemStatus.PARTIAL].includes(item.status)) {
            // Calculate quantity and reversed of product
            const countExported =
              await this.inventoryService.countInvenQuantity(
                item.id,
                InventoryAction.EXPORT,
              );

            const quantityNotExported = item.quantity - countExported;

            const product = await queryRunner.manager.findOneOrFail(Product, {
              where: {
                id: item.itemableId,
              },
            });

            product.quantity += quantityNotExported;
            product.reserved -= quantityNotExported;

            await queryRunner.manager.save(product);
          }
        } else {
          await queryRunner.manager
            .createQueryBuilder()
            .update(Appointment)
            .set({ status: AppointmentStatus.CANCELLED })
            .where('itemId = :itemId', { itemId: item.id })
            .execute();
        }

        // Set all item to inactive
        await queryRunner.manager.save(item);
        // item.isActive = false;
        // item.adjustmentType = AdjustmentType.CANCELLED;

        await this.itemService.disableItemOfSource(
          order.id,
          SourceType.ORDER,
          queryRunner.manager,
        );
      }

      // Set status of order to cancelled
      order.status = SourceStatus.CANCELLED;
      await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();
      return { order };
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async addItem(orderId: number, createItemDto: CreateItemDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const order = await this.findOne(orderId, true, queryRunner.manager);

    const isItemExist = await queryRunner.manager.exists(Item, {
      where: {
        itemableId: createItemDto.itemableId,
        itemableType: createItemDto.itemableType,
        sourceId: order.id,
        sourceType: SourceType.ORDER,
        isActive: true,
      },
    });

    if (isItemExist) throw new BadRequestException('Item is existed!');

    try {
      const item = await this.itemService.add(
        createItemDto,
        orderId,
        SourceType.ORDER,
        queryRunner.manager,
        AdjustmentType.ADD,
      );

      // Update order information
      order.totalAmount += Number(item.finalAmount);

      order.finalAmount = await this.itemService.calculateDiscountAmount(
        Number(order.totalAmount),
        order?.discount?.id ?? undefined,
      );
      order.quantity += item.quantity;

      if (item.itemableType === ItemableType.PRODUCT) {
        const product = await queryRunner.manager.findOneByOrFail(Product, {
          id: item.itemableId,
        });

        // Quantity of product is not enough
        if (product.quantity < item.quantity) {
          throw new BadRequestException(
            'Not enough stock for product ' + product.id,
          );
        }

        // // Update quantity and reversed of product
        product.quantity -= item.quantity;
        product.reserved += item.quantity;
        await queryRunner.manager.save(product);
      }

      // Update order status if it is completed
      order.status =
        order.status === SourceStatus.COMPLETED
          ? SourceStatus.PROCESSING
          : order.status;

      await queryRunner.manager.save(order);
      await queryRunner.commitTransaction();
      return { item };
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async removeItem(orderId: number, itemId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const order = await queryRunner.manager.findOne(Order, {
      where: {
        id: orderId,
        status: Not(SourceStatus.CANCELLED),
      },
    });

    if (!order) throw new NotFoundException('Order not found!');

    const item = await queryRunner.manager.findOne(Item, {
      where: {
        id: itemId,
        sourceId: orderId,
        sourceType: SourceType.ORDER,
        isActive: true,
      },
    });

    if (!item) throw new NotFoundException('Item not found!');

    try {
      //Cancel appointments
      if (item.itemableType === ItemableType.SERVICE) {
        await queryRunner.manager.update(
          Appointment,
          { item: { id: itemId } },
          { status: AppointmentStatus.CANCELLED },
        );
      }

      // Update item information
      item.isActive = false;
      item.adjustmentType = AdjustmentType.REMOVE;

      await queryRunner.manager.save(item);
      // Update item order
      order.quantity -= item.quantity;
      order.totalAmount -= item.finalAmount;
      order.finalAmount = await this.itemService.calculateDiscountAmount(
        order.totalAmount,
        order.discount?.id ?? null,
      );

      // Update transaction
      const transaction = await queryRunner.manager.findOne(Transaction, {
        where: { sourceId: orderId, sourceType: SourceType.ORDER },
        select: ['id', 'totalAmount', 'paidAmount', 'status'],
      });
      if (!transaction) throw new NotFoundException('Transaction not found!');

      transaction.totalAmount = order.finalAmount;
      transaction.status = this.transactionService.getTransactionStatus(
        transaction.paidAmount,
        transaction.totalAmount,
      );
      await queryRunner.manager.save(transaction);

      order.status = await this.itemService.getSourceStatus(
        orderId,
        SourceType.ORDER,
        queryRunner.manager,
        transaction.status,
      );

      await queryRunner.manager.save(order);
      await queryRunner.commitTransaction();
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
