import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AdjustmentType,
  AppointmentStatus,
  AppointmentType,
  CommonStatus,
  EnrollmentStatus,
  InventoryAction,
  ItemableType,
  ItemStatus,
  PartnerType,
  PayerType,
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
import { ChangeCourseDto } from './dto/change-course.dto';
import { CreateItemDto } from 'src/item/dto/create-item.dto';
import { Product } from 'src/product/entities/product.entity';
import { Partner } from 'src/partner/entities/partner.entity';
import { PaginationDto } from './../common/dtos/pagination.dto';
import { Discount } from 'src/discount/entities/discount.entity';
import { InventoryService } from 'src/inventory/inventory.service';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { DataSource, EntityManager, In, Not, Repository } from 'typeorm';
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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    if (createOrderDto.items.length === 0)
      throw new BadRequestException('Item is required!');

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
    const items: Item[] = [];
    try {
      for (const itemDto of createOrderDto.items) {
        // Add item to order
        const item = await this.itemService.add(
          itemDto,
          creatorId,
          order.id,
          SourceType.ORDER,
          queryRunner.manager,
          order.customer.id,
        );

        items.push(item);
      }

      const { quantity, totalAmount } =
        await this.itemService.calculateSourceAmountAndQty(
          order.id,
          SourceType.ORDER,
          queryRunner.manager,
        );

      // Update quantity and reversed of product
      const itemResults = await queryRunner.manager.find(Item, {
        where: {
          sourceId: order.id,
          sourceType: SourceType.ORDER,
          isActive: true,
          itemableType: ItemableType.PRODUCT,
        },
      });

      for (const itemResult of itemResults) {
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

      const finalAmount = await this.itemService.calculateDiscountAmount(
        totalAmount,
        createOrderDto.discountId,
      );

      queryRunner.manager.merge(Order, order, {
        quantity,
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
        payerType: PayerType.PARTNER,
        payerId: createOrderDto.customerId,
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
        'order.createdAt',
        'order.status',
        'order.finalAmount',
        'order.note',
        'creator.fullName',
        'customer.fullName',
        'discount.code',
      ])
      .orderBy('order.createdAt', 'DESC');

    if (
      paginationDto?.page !== undefined &&
      paginationDto?.limit !== undefined
    ) {
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
        'order.createdAt',
        'order.note',
        'creator.fullName',
        'customer.fullName',
        'discount.code',
      ])
      .orderBy('order.createdAt', 'DESC');

    if (
      paginationDto?.page !== undefined &&
      paginationDto?.limit !== undefined
    ) {
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
  async findOneFull(id: number, isActive?: boolean, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Order) : this.orderRepo;

    const order = await repo.findOne({
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

    // Gán items trực tiếp vào instance
    (order as any).items = items;

    return order;
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

  async cancelOrder(orderId: number, creatorId: number, payerId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    // Load order
    // const order = await this.findOne(orderId, true, queryRunner.manager);
    const order = await this.findOneFull(orderId, true, queryRunner.manager);

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
        note: `Refund for order #${order.id}`,
        payerId,
        payerType: PayerType.USER,
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
        } else if (item.itemableType === ItemableType.SERVICE) {
          await queryRunner.manager
            .createQueryBuilder()
            .update(Appointment)
            .set({ status: AppointmentStatus.CANCELLED })
            .where('itemId = :itemId', { itemId: item.id })
            .execute();
        } else {
          // Withdraw all enrollment of this item
          await queryRunner.manager
            .createQueryBuilder()
            .update(Enrollment)
            .set({ status: EnrollmentStatus.WITHDRAWN })
            .andWhere('itemId = :itemId', {
              itemId: item.id,
            })
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

  async addItem(
    orderId: number,
    createItemDtos: CreateItemDto[],
    creatorId: number,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const order = await this.findOneFull(orderId, true, queryRunner.manager);
    const items: Item[] = [];
    try {
      for (const createItemDto of createItemDtos) {
        const item = await this.itemService.add(
          createItemDto,
          creatorId,
          orderId,
          SourceType.ORDER,
          queryRunner.manager,
          order.customer.id,
        );

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

        items.push(item);
      }

      // Update order information
      const { quantity, totalAmount } =
        await this.itemService.calculateSourceAmountAndQty(
          orderId,
          SourceType.ORDER,
          queryRunner.manager,
        );

      order.totalAmount = totalAmount;
      order.quantity = quantity;

      order.finalAmount = await this.itemService.calculateDiscountAmount(
        Number(order.totalAmount),
        order?.discount?.id,
      );

      // Update transaction
      const transaction = await queryRunner.manager.findOne(Transaction, {
        where: { sourceId: orderId, sourceType: SourceType.ORDER },
      });
      if (!transaction) throw new NotFoundException('Transaction not found!');

      transaction.totalAmount = order.finalAmount;
      transaction.status = this.transactionService.getTransactionStatus(
        transaction.paidAmount,
        transaction.totalAmount,
      );
      await queryRunner.manager.save(transaction);

      // Update order status if it is completed
      order.status = await this.itemService.getSourceStatus(
        orderId,
        SourceType.ORDER,
        queryRunner.manager,
      );

      await queryRunner.manager.save(order);
      await queryRunner.commitTransaction();
      return { items };
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
      relations: ['customer', 'discount'],
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

      // Withdrawn enrollment
      if (item.itemableType === ItemableType.COURSE) {
        await queryRunner.manager.update(
          Enrollment,
          {
            item: { id: item.id },
          },
          { status: EnrollmentStatus.WITHDRAWN },
        );
      }

      // Update item information
      item.isActive = false;
      item.adjustmentType = AdjustmentType.REMOVE;

      await queryRunner.manager.save(item);

      // Update item order
      const { quantity, totalAmount } =
        await this.itemService.calculateSourceAmountAndQty(
          orderId,
          SourceType.ORDER,
          queryRunner.manager,
        );

      order.quantity = quantity;
      order.totalAmount = totalAmount;

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

      return { message: 'Remove item success!' };
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async transferServiceOwner(
    orderId: number,
    itemId: number,
    newCustomerId: number,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if order exist
      const order = await queryRunner.manager.exists(Order, {
        where: { id: orderId, status: Not(SourceStatus.CANCELLED) },
      });
      if (!order) throw new NotFoundException('Order not found!');

      // Check if item exist and belong to order
      await this.itemService.transferService(
        itemId,
        orderId,
        newCustomerId,
        queryRunner.manager,
      );

      // Remove all bonus appointment
      await queryRunner.manager.delete(Appointment, {
        status: Not(
          In([AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED]),
        ),
        item: { id: itemId },
        type: AppointmentType.BONUS,
      });

      // Update uncompleted appointment to new customer
      const uncompletedAppointment = await queryRunner.manager.find(
        Appointment,
        {
          where: {
            status: Not(
              In([AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED]),
            ),
            item: { id: itemId },
            type: AppointmentType.MAIN,
          },
        },
      );
      const newCustomer = await queryRunner.manager.findOne(Partner, {
        where: { id: newCustomerId },
      });
      if (!newCustomer) throw new NotFoundException('Customer not found!');
      uncompletedAppointment.map((appointment) => {
        appointment.customer = newCustomer;
      });
      await queryRunner.manager.save(uncompletedAppointment);

      await queryRunner.commitTransaction();
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async changeCourse(
    itemId: number,
    orderId: number,
    creatorId: number,
    changeCourseDto: ChangeCourseDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // validate item exist and belong to order
    const order = await this.findOneFull(orderId, true);

    const item = await queryRunner.manager.findOne(Item, {
      where: {
        id: itemId,
        itemableType: ItemableType.COURSE,
        isActive: true,
        sourceId: orderId,
        sourceType: SourceType.ORDER,
      },
    });

    if (!item) throw new NotFoundException('Item not found!');

    if (item.status === ItemStatus.CHANGED)
      throw new BadRequestException('Item has been changed!');

    // check quantity want to change is valid(1 -> item.quantiity)
    if (changeCourseDto.changeQuantity <= 0)
      throw new BadRequestException('Change quantity must be greater than 0!');

    if (changeCourseDto.changeQuantity > item.quantity)
      throw new BadRequestException(
        `Change quantity cannot greater than item quantity: ${item.quantity}!`,
      );

    if (changeCourseDto.courseId === item.itemableId)
      throw new BadRequestException('Course is not modified!');

    // Create quantity item want change
    const createItemDto: CreateItemDto = {
      itemableId: changeCourseDto.courseId,
      itemableType: ItemableType.COURSE,
      quantity: changeCourseDto.changeQuantity,
      discountId: item?.discount?.id,
      unitPrice: item.unitPrice,
    };

    try {
      // remove slot in course
      if (changeCourseDto.changeQuantity === item.quantity) {
        item.status = ItemStatus.CHANGED;
        item.isActive = false;
      } else {
        const changedItem = await this.itemService.add(
          createItemDto,
          creatorId,
          orderId,
          SourceType.ORDER,
          queryRunner.manager,
          order.customer.id,
          true,
        );

        await queryRunner.manager.save(changedItem);

        item.quantity = item.quantity - changeCourseDto.changeQuantity;
        await this.itemService.recalculateItem(item, queryRunner.manager);
      }

      await queryRunner.manager.save(item);

      // Update order information
      const { quantity, totalAmount } =
        await this.itemService.calculateSourceAmountAndQty(
          orderId,
          SourceType.ORDER,
          queryRunner.manager,
        );

      order.totalAmount = totalAmount;
      order.quantity = quantity;

      order.finalAmount = await this.itemService.calculateDiscountAmount(
        Number(order.totalAmount),
        order?.discount?.id,
      );

      await queryRunner.manager.save(order);

      // Update transaction
      const transaction = await queryRunner.manager.findOne(Transaction, {
        where: { sourceId: orderId, sourceType: SourceType.ORDER },
      });
      if (!transaction) throw new NotFoundException('Transaction not found!');

      transaction.totalAmount = order.finalAmount;
      transaction.status = this.transactionService.getTransactionStatus(
        transaction.paidAmount,
        transaction.totalAmount,
      );
      await queryRunner.manager.save(transaction);

      // Update order status if it is completed
      order.status = await this.itemService.getSourceStatus(
        orderId,
        SourceType.ORDER,
        queryRunner.manager,
      );

      // Create new order
      const createOrderDto: CreateOrderDto = {
        items: [createItemDto],
        note: `Change item from order #${order.id}`,
        discountId: order?.discount?.id,
        customerId: order.customer.id,
      };

      await this.create(createOrderDto, creatorId);

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
