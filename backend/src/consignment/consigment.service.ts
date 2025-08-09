import { PaginationDto } from './../common/dtos/pagination.dto';
import {
  AdjustmentType,
  PayerType,
  SourceStatus,
  SourceType,
  TransactionType,
} from 'src/common/enums/enum';
import {
  ConsignmentType,
  ItemableType,
  ItemStatus,
  PartnerType,
} from './../common/enums/enum';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ItemService } from 'src/item/item.service';
import { User } from 'src/user/entities/user.entity';
import { Item } from 'src/item/entities/item.entity';
import { Consignment } from './entities/consigment.entity';
import { Product } from 'src/product/entities/product.entity';
import { Partner } from 'src/partner/entities/partner.entity';
import { DataSource, EntityManager, Not, Repository } from 'typeorm';
import { InventoryService } from 'src/inventory/inventory.service';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { CreateConsignmentDto } from './dto/create-consignment.dto';
import { TransactionService } from 'src/transaction/transaction.service';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { CreateTransactionDto } from 'src/transaction/dto/create-transaction.dto';
import { CreateTransactionNoSourceDto } from 'src/transaction/dto/create-transaction-no-source.dto';
import { CreateItemDto } from 'src/item/dto/create-item.dto';
@Injectable()
export class ConsignmentService {
  constructor(
    @InjectRepository(Consignment)
    private consignmentRepo: Repository<Consignment>,
    private dataSource: DataSource,
    private itemService: ItemService,
    private transactionService: TransactionService,

    @Inject(forwardRef(() => InventoryService))
    private inventoryService: InventoryService,
  ) {}

  async create(createConsignmentDto: CreateConsignmentDto, creatorId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    if (createConsignmentDto.items.length === 0)
      throw new BadRequestException('Item is required!');

    const consignment = queryRunner.manager.create(Consignment, {
      ...createConsignmentDto,
      quantity: 0,
      totalAmount: 0,
      finalAmount: 0,
    });

    consignment.creator = await queryRunner.manager.findOneByOrFail(User, {
      id: creatorId,
    });

    const type =
      createConsignmentDto.type === ConsignmentType.IN
        ? PartnerType.SUPPLIER
        : PartnerType.CUSTOMER;

    consignment.partner = await queryRunner.manager.findOneOrFail(Partner, {
      where: {
        id: createConsignmentDto.partnerId,
        type,
      },
    });
    await queryRunner.manager.save(consignment);
    try {
      for (const item of createConsignmentDto.items) {
        if (item.itemableType !== ItemableType.PRODUCT)
          throw new BadRequestException('ItemableType is not valid!');

        await this.itemService.add(
          item,
          creatorId,
          consignment.id,
          SourceType.CONSIGNMENT,
          queryRunner.manager,
          undefined,
        );
      }

      const { quantity, totalAmount } =
        await this.itemService.calculateSourceAmountAndQty(
          consignment.id,
          SourceType.CONSIGNMENT,
          queryRunner.manager,
        );

      // Update quantity and reversed of product
      if (consignment.type === ConsignmentType.OUT) {
        const itemResults = await queryRunner.manager.find(Item, {
          where: {
            sourceId: consignment.id,
            sourceType: SourceType.CONSIGNMENT,
          },
        });

        for (const itemResult of itemResults) {
          if (itemResult.itemableType !== ItemableType.PRODUCT)
            throw new BadRequestException('Itemable Type is not valid!');

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

      let finalAmount = totalAmount;
      if (createConsignmentDto.commissionRate) {
        finalAmount =
          totalAmount -
          (createConsignmentDto.commissionRate * totalAmount) / 100;
      }

      queryRunner.manager.merge(Consignment, consignment, {
        quantity,
        totalAmount,
        finalAmount,
      });
      await queryRunner.manager.save(consignment);

      if (
        consignment.type === ConsignmentType.IN &&
        !createConsignmentDto.payerId
      )
        throw new BadRequestException('Payer ID required!');

      if (
        consignment.type === ConsignmentType.OUT &&
        createConsignmentDto.payerId
      )
        throw new BadRequestException('Payer ID should not exist!');

      // Create transaction
      const createTransactionDto: CreateTransactionDto = {
        type:
          consignment.type === ConsignmentType.IN
            ? TransactionType.EXPENSE
            : TransactionType.INCOME,
        sourceType: SourceType.CONSIGNMENT,
        sourceId: consignment.id,
        totalAmount: finalAmount,
        note: `Transaction of consignment ${consignment.id}`,
        payerType:
          consignment.type === ConsignmentType.IN
            ? PayerType.USER
            : PayerType.PARTNER,
        payerId:
          consignment.type === ConsignmentType.IN
            ? createConsignmentDto.payerId!
            : createConsignmentDto.partnerId,
      };

      await this.transactionService.create(
        createTransactionDto,
        creatorId,
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();
      return consignment;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(paginationDto?: PaginationDto) {
    const queryBuilder = this.consignmentRepo
      .createQueryBuilder('consignment')
      .leftJoinAndSelect('consignment.creator', 'creator')
      .leftJoinAndSelect('consignment.partner', 'partner')
      .select([
        'consignment.id',
        'consignment.type',
        'consignment.totalAmount',
        'consignment.finalAmount',
        'consignment.commissionRate',
        'consignment.status',
        'consignment.createdAt',
        'consignment.note',
        'creator.fullName',
        'partner.fullName',
      ])
      .orderBy('consignment.createdAt', 'DESC');

    if (
      paginationDto?.page !== undefined &&
      paginationDto?.limit !== undefined
    ) {
      const { page, limit } = paginationDto;

      const [consignments, total] = await queryBuilder
        .skip(page * limit)
        .take(limit)
        .getManyAndCount();

      return { consignments, total };
    } else {
      const consignments = await queryBuilder.getMany();
      return consignments;
    }
  }

  async findAllActive(paginationDto?: PaginationDto) {
    const queryBuilder = this.consignmentRepo
      .createQueryBuilder('consignment')
      .leftJoinAndSelect('consignment.creator', 'creator')
      .leftJoinAndSelect('consignment.partner', 'partner')
      .where('consignment.isActive = :isActive', { isActive: true })
      .select([
        'consignment.id',
        'consignment.type',
        'consignment.totalAmount',
        'consignment.finalAmount',
        'consignment.createdAt',
        'consignment.commissionRate',
        'consignment.note',
        'creator.fullName',
        'partner.fullName',
      ])
      .orderBy('consignment.createdAt', 'DESC');

    if (
      paginationDto?.page !== undefined &&
      paginationDto?.limit !== undefined
    ) {
      const { page, limit } = paginationDto;

      const [consignments, total] = await queryBuilder
        .skip(page * limit)
        .take(limit)
        .getManyAndCount();

      return { consignments, total };
    } else {
      const consignments = await queryBuilder.getMany();
      return consignments;
    }
  }

  async findOneFull(id: number, isActive?: boolean, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(Consignment)
      : this.consignmentRepo;

    const consignment = await repo.findOne({
      where: { id },
      relations: ['creator', 'partner'],
    });

    if (!consignment) throw new NotFoundException('Consignment not found!');

    if (isActive && consignment.status === SourceStatus.CANCELLED)
      throw new NotFoundException('Consignment is cancelled!');

    const items = await this.itemService.findItemsBySource(
      consignment.id,
      SourceType.CONSIGNMENT,
      undefined,
      undefined,
      isActive ? true : undefined,
    );

    // Gán items trực tiếp vào instance
    (consignment as any).items = items;

    return consignment;
  }

  async findOne(id: number, checkActive?: boolean, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(Consignment)
      : this.consignmentRepo;

    const consignment = await repo.findOneBy({ id });

    if (!consignment) throw new NotFoundException('Consignment not found!');

    if (checkActive && consignment.status === SourceStatus.CANCELLED)
      throw new NotFoundException('Consignment is cancelled!');

    return consignment;
  }

  async handledItem(itemId: number, creatorId: number, quantity?: number) {
    const item = await this.itemService.findItem(
      itemId,
      ItemableType.PRODUCT,
      undefined,
      true,
    );

    if (!item) throw new NotFoundException('Item not found!');

    if (
      item.status === ItemStatus.IMPORTED ||
      item.status === ItemStatus.EXPORTED
    )
      throw new BadRequestException(`Item is ${item.status}!`);

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
        SourceType.CONSIGNMENT,
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

  async handleConsignment(consignmentId: number, creatorId: number) {
    const consignment = await this.findOneFull(consignmentId, true);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // Find list item which is not exported/imported
    const itemsNotHandled = await this.itemService.findItemsBySource(
      consignment.id,
      SourceType.CONSIGNMENT,
      ItemableType.PRODUCT,
      [ItemStatus.NONE, ItemStatus.PARTIAL],
      true,
    );

    if (itemsNotHandled.length === 0)
      return {
        message: `All item of consignment is ${consignment.type === ConsignmentType.IN ? 'imported' : 'exported'}!`,
      };

    const itemInventories: Inventory[] = [];

    try {
      for (const item of itemsNotHandled) {
        const itemInventory =
          await this.inventoryService.createInventoryForItem(
            item,
            creatorId,
            queryRunner.manager,
          );

        await queryRunner.manager.save(item);

        itemInventories.push({
          ...itemInventory,
          item,
        });
      }
      const consignmentStatus = await this.itemService.getSourceStatus(
        consignmentId,
        SourceType.CONSIGNMENT,
        queryRunner.manager,
      );

      consignment.status = consignmentStatus;
      await queryRunner.manager.save(consignment);
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

  async cancelConsignment(
    consignmentId: number,
    creatorId: number,
    payerId?: number,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // Load consignment
    const consignment = await this.findOneFull(
      consignmentId,
      true,
      queryRunner.manager,
    );

    if (consignment.status === SourceStatus.CANCELLED)
      throw new BadRequestException('Consignment already cancelled!');

    try {
      // Note all inventory, transaction
      // Create transaction to refund
      const oldTransaction = await queryRunner.manager.findOneOrFail(
        Transaction,
        {
          where: {
            sourceId: consignmentId,
            sourceType: SourceType.CONSIGNMENT,
          },
          select: ['id', 'paidAmount'],
        },
      );

      // type: in => nhap hang => payer: user => huy => payer: partner = customer id=> khong can payerId
      // type: out => xuat hang => payer: partner => huy => payer: user => CAN payerId

      if (consignment.type === ConsignmentType.OUT && !payerId)
        throw new BadRequestException('Payer ID required!');

      // Type of refund transaction belongs to consignment type
      const createTransactionNoSourceDto: CreateTransactionNoSourceDto = {
        type:
          consignment.type === ConsignmentType.IN
            ? TransactionType.INCOME
            : TransactionType.EXPENSE,
        totalAmount: oldTransaction.paidAmount,
        note: `Refund for consignment #${consignment.id}`,

        payerType:
          consignment.type === ConsignmentType.IN
            ? PayerType.PARTNER
            : PayerType.USER,

        payerId:
          consignment.type === ConsignmentType.IN
            ? consignment.partner.id
            : payerId!,
      };

      await this.transactionService.createNoSource(
        createTransactionNoSourceDto,
        creatorId,
        queryRunner.manager,
      );

      await this.itemService.disableItemOfSource(
        consignment.id,
        SourceType.CONSIGNMENT,
        queryRunner.manager,
      );

      // Set status of consignment to cancelled
      consignment.status = SourceStatus.CANCELLED;
      await queryRunner.manager.save(consignment);

      await queryRunner.commitTransaction();
      return { consignment };
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async addItem(
    consignmentId: number,
    createItemDtos: CreateItemDto[],
    creatorId: number,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const consignment = await this.findOne(
      consignmentId,
      true,
      queryRunner.manager,
    );

    const items: Item[] = [];

    try {
      for (const createItemDto of createItemDtos) {
        if (createItemDto.discountId)
          throw new BadRequestException('Discount should not exist!');

        if (createItemDto.itemableType !== ItemableType.PRODUCT)
          throw new BadRequestException(
            'Cannot create item which is not product in purchase!',
          );

        const item = await this.itemService.add(
          createItemDto,
          creatorId,
          consignmentId,
          SourceType.CONSIGNMENT,
          queryRunner.manager,
          undefined,
        );
        items.push(item);
      }

      // Update consignment information
      const { quantity, totalAmount } =
        await this.itemService.calculateSourceAmountAndQty(
          consignmentId,
          SourceType.CONSIGNMENT,
          queryRunner.manager,
        );

      consignment.totalAmount = totalAmount;
      consignment.quantity = quantity;
      consignment.finalAmount =
        consignment.totalAmount * (1 - consignment.commissionRate / 100);

      // Update transaction
      const transaction = await queryRunner.manager.findOne(Transaction, {
        where: { sourceId: consignmentId, sourceType: SourceType.CONSIGNMENT },
      });
      if (!transaction) throw new NotFoundException('Transaction not found!');

      transaction.totalAmount = consignment.finalAmount;
      transaction.status = this.transactionService.getTransactionStatus(
        transaction.paidAmount,
        transaction.totalAmount,
      );

      // Update consignment status
      consignment.status = await this.itemService.getSourceStatus(
        consignmentId,
        SourceType.CONSIGNMENT,
        queryRunner.manager,
      );

      await queryRunner.manager.save(transaction);
      await queryRunner.manager.save(consignment);
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

  async removeItem(consignmentId: number, itemId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const consignment = await queryRunner.manager.findOne(Consignment, {
      where: {
        id: consignmentId,
        status: Not(SourceStatus.CANCELLED),
      },
    });

    if (!consignment) throw new NotFoundException('Consignment not found!');

    const item = await queryRunner.manager.findOne(Item, {
      where: {
        id: itemId,
        sourceId: consignmentId,
        sourceType: SourceType.CONSIGNMENT,
        isActive: true,
      },
    });

    if (!item) throw new NotFoundException('Item not found!');

    try {
      // Update item information
      item.isActive = false;
      item.adjustmentType = AdjustmentType.REMOVE;

      await queryRunner.manager.save(item);

      // Update item consignment
      const { quantity, totalAmount } =
        await this.itemService.calculateSourceAmountAndQty(
          consignmentId,
          SourceType.CONSIGNMENT,
          queryRunner.manager,
        );

      consignment.quantity = quantity;
      consignment.totalAmount = totalAmount;
      consignment.finalAmount =
        consignment.totalAmount * (1 - consignment.commissionRate / 100);

      // Update transaction
      const transaction = await queryRunner.manager.findOne(Transaction, {
        where: { sourceId: consignmentId, sourceType: SourceType.CONSIGNMENT },
        select: ['id', 'totalAmount', 'paidAmount', 'status'],
      });
      if (!transaction) throw new NotFoundException('Transaction not found!');

      transaction.totalAmount = consignment.finalAmount;

      transaction.status = this.transactionService.getTransactionStatus(
        transaction.paidAmount,
        transaction.totalAmount,
      );
      await queryRunner.manager.save(transaction);

      consignment.status = await this.itemService.getSourceStatus(
        consignmentId,
        SourceType.CONSIGNMENT,
        queryRunner.manager,
        transaction.status,
      );

      await queryRunner.manager.save(consignment);
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
