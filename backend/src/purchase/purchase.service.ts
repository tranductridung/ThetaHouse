import { PaginationDto } from './../common/dtos/pagination.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AdjustmentType,
  ItemableType,
  ItemStatus,
  PartnerType,
  SourceStatus,
  SourceType,
  TransactionType,
} from 'src/common/enums/enum';
import { InjectRepository } from '@nestjs/typeorm';
import { ItemService } from 'src/item/item.service';
import { User } from 'src/user/entities/user.entity';
import { Item } from 'src/item/entities/item.entity';
import { Purchase } from './entities/purchase.entity';
import { CreateItemDto } from 'src/item/dto/create-item.dto';
import { Partner } from 'src/partner/entities/partner.entity';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { InventoryService } from 'src/inventory/inventory.service';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { DataSource, EntityManager, Not, Repository } from 'typeorm';
import { TransactionService } from 'src/transaction/transaction.service';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { CreateTransactionDto } from 'src/transaction/dto/create-transaction.dto';
import { CreateTransactionNoSourceDto } from 'src/transaction/dto/create-transaction-no-source.dto';
@Injectable()
export class PurchaseService {
  constructor(
    @InjectRepository(Purchase) private purchaseRepo: Repository<Purchase>,
    private itemService: ItemService,
    private inventoryService: InventoryService,
    private dataSource: DataSource,
    private transactionService: TransactionService,
  ) {}

  async create(createPurchaseDto: CreatePurchaseDto, creatorId: number) {
    this.itemService.isProduct(createPurchaseDto.items);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // Create purchase
    const purchase = queryRunner.manager.create(Purchase, {
      ...createPurchaseDto,
      quantity: 0,
      totalAmount: 0,
      finalAmount: 0,
    });

    // Add creator and supplier for purchase
    purchase.creator = await queryRunner.manager.findOneByOrFail(User, {
      id: creatorId,
    });
    purchase.supplier = await queryRunner.manager.findOneByOrFail(Partner, {
      id: createPurchaseDto.supplierId,
      type: PartnerType.SUPPLIER,
    });

    await queryRunner.manager.save(purchase);

    // Calculate amount
    let totalAmount = 0;
    let purchaseQuantity = 0;
    try {
      for (const item of createPurchaseDto.items) {
        if (item.itemableType !== ItemableType.PRODUCT)
          throw new BadRequestException('ItemableType is not valid!');

        const itemResult = await this.itemService.add(
          item,
          purchase.id,
          SourceType.PURCHASE,
          queryRunner.manager,
          undefined,
        );
        totalAmount += itemResult.finalAmount;
        purchaseQuantity += itemResult.quantity;
      }
      console.log('hello', createPurchaseDto.discountAmount);
      const finalAmount = createPurchaseDto.discountAmount
        ? totalAmount - createPurchaseDto.discountAmount > 0
          ? totalAmount - createPurchaseDto.discountAmount
          : 0
        : totalAmount;

      console.log(finalAmount);
      queryRunner.manager.merge(Purchase, purchase, {
        quantity: purchaseQuantity,
        totalAmount,
        finalAmount,
        discountAmount: createPurchaseDto.discountAmount,
      });
      await queryRunner.manager.save(purchase);

      // Create transaction
      const createTransactionDto: CreateTransactionDto = {
        type: TransactionType.EXPENSE,
        sourceType: SourceType.PURCHASE,
        sourceId: purchase.id,
        totalAmount: finalAmount,
        note: `Transaction of purchase ${purchase.id}!`,
      };

      await this.transactionService.create(
        createTransactionDto,
        creatorId,
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();
      return purchase;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(paginationDto?: PaginationDto) {
    const queryBuilder = this.purchaseRepo
      .createQueryBuilder('purchase')
      .leftJoinAndSelect('purchase.creator', 'creator')
      .leftJoinAndSelect('purchase.supplier', 'supplier')
      .select([
        'purchase.id',
        'purchase.quantity',
        'purchase.totalAmount',
        'purchase.finalAmount',
        'purchase.discountAmount',
        'purchase.note',
        'purchase.status',
        'creator.fullName',
        'supplier.fullName',
      ])
      .orderBy('purchase.id', 'ASC');

    if (paginationDto) {
      const { page, limit } = paginationDto;

      const [purchases, total] = await queryBuilder
        .skip(page * limit)
        .take(limit)
        .getManyAndCount();

      return { purchases, total };
    } else {
      const purchases = await queryBuilder.getMany();
      return purchases;
    }
  }

  async findAllActive(paginationDto?: PaginationDto) {
    const queryBuilder = this.purchaseRepo
      .createQueryBuilder('purchase')
      .leftJoinAndSelect('purchase.creator', 'creator')
      .leftJoinAndSelect('purchase.supplier', 'supplier')
      .where('purchase.status != :status', { status: SourceStatus.CANCELLED })
      .select([
        'purchase.id',
        'purchase.quantity',
        'purchase.totalAmount',
        'purchase.finalAmount',
        'purchase.status',
        'purchase.discountAmount',
        'purchase.note',
        'creator.fullName',
        'supplier.fullName',
      ])
      .orderBy('purchase.id', 'ASC');
    if (paginationDto) {
      const { page, limit } = paginationDto;

      const [purchases, total] = await queryBuilder
        .skip(page * limit)
        .take(limit)
        .getManyAndCount();

      return { purchases, total };
    } else {
      const purchases = await queryBuilder.getMany();
      return purchases;
    }
  }

  // The isActive parameter is used to check whether the purchase is cancelled or not.
  // If isActive is not used, the function will retrieve the purchase without checking its active status.
  async findOne(id: number, checkActive?: boolean, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Purchase) : this.purchaseRepo;

    const purchase = await repo.findOneBy({ id });

    if (!purchase) throw new NotFoundException('Purchase not found!');

    if (checkActive && purchase.status === SourceStatus.CANCELLED)
      throw new NotFoundException('Purchase is cancelled!');

    return purchase;
  }

  // The isActive parameter is used to check whether the purchase is cancelled or not.
  // If isActive is not used, the function will retrieve the purchase without checking its active status.
  async findOneFull(id: number, isActive?: boolean) {
    const purchase = await this.purchaseRepo.findOne({
      where: { id },
      relations: ['supplier', 'creator'],
    });

    if (!purchase) throw new NotFoundException('Purchase not found!');

    if (isActive && purchase.status === SourceStatus.CANCELLED)
      throw new NotFoundException('Purchase is cancelled!');

    const items = await this.itemService.findItemsBySource(
      purchase.id,
      SourceType.PURCHASE,
      undefined,
      undefined,
      isActive ? true : undefined,
    );

    // Gán items trực tiếp vào instance
    (purchase as any).items = items;

    return purchase;
  }

  async importItem(itemId: number, creatorId: number, quantity?: number) {
    const item = await this.itemService.findItem(
      itemId,
      ItemableType.PRODUCT,
      undefined,
      true,
    );

    if (!item) throw new NotFoundException('Item not found!');

    if (item.status === ItemStatus.IMPORTED)
      throw new BadRequestException('Item is imported!');

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
        SourceType.PURCHASE,
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

  async importPurchase(purchaseId: number, creatorId: number) {
    const purchase = await this.findOneFull(purchaseId, true);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // Find list item which is not imported
    const itemsNotImported = await this.itemService.findItemsBySource(
      purchase.id,
      SourceType.PURCHASE,
      ItemableType.PRODUCT,
      [ItemStatus.NONE, ItemStatus.PARTIAL],
      true,
    );

    if (itemsNotImported.length === 0)
      return { message: 'All item of purchase is imported!' };

    const itemInventories: Inventory[] = [];
    try {
      for (const item of itemsNotImported) {
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
      const purchaseStatus = await this.itemService.getSourceStatus(
        purchaseId,
        SourceType.PURCHASE,
        queryRunner.manager,
      );

      purchase.status = purchaseStatus;

      await queryRunner.manager.save(purchase);

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

  async cancelPurchase(purchaseId: number, creatorId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // Load purchase
    const purchase = await this.findOne(purchaseId, true, queryRunner.manager);

    try {
      // Note all inventory, transaction
      // Create transaction to refund
      const oldTransaction = await queryRunner.manager.findOneOrFail(
        Transaction,
        {
          where: {
            sourceType: SourceType.PURCHASE,
            sourceId: purchaseId,
          },
          select: ['id', 'paidAmount'],
        },
      );

      const createTransactionNoSourceDto: CreateTransactionNoSourceDto = {
        type: TransactionType.INCOME,
        totalAmount: oldTransaction.paidAmount,
        paidAmount: 0,
        note: `Refund for purchase #${purchase.id}`,
      };

      await this.transactionService.createNoSource(
        createTransactionNoSourceDto,
        creatorId,
        queryRunner.manager,
      );

      await this.itemService.disableItemOfSource(
        purchase.id,
        SourceType.PURCHASE,
        queryRunner.manager,
      );

      // Set status of purchase to cancelled
      purchase.status = SourceStatus.CANCELLED;
      await queryRunner.manager.save(purchase);

      await queryRunner.commitTransaction();
      return { purchase };
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async addItem(purchaseId: number, createItemDto: CreateItemDto) {
    if (createItemDto.itemableType === ItemableType.SERVICE)
      throw new BadRequestException('Cannot create item service in purchase!');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const purchase = await this.findOne(purchaseId, true, queryRunner.manager);

    const isItemExist = await queryRunner.manager.exists(Item, {
      where: {
        itemableId: createItemDto.itemableId,
        itemableType: createItemDto.itemableType,
        sourceId: purchase.id,
        sourceType: SourceType.PURCHASE,
        isActive: true,
      },
    });

    if (isItemExist) throw new BadRequestException('Item is existed!');

    try {
      const item = await this.itemService.add(
        createItemDto,
        purchaseId,
        SourceType.PURCHASE,
        queryRunner.manager,
        AdjustmentType.ADD,
      );

      // Update purchase information
      purchase.totalAmount += item.finalAmount;
      purchase.finalAmount = purchase.totalAmount - purchase.discountAmount;
      purchase.quantity += item.quantity;

      const transaction = await queryRunner.manager.findOne(Transaction, {
        where: { sourceId: purchaseId, sourceType: SourceType.PURCHASE },
      });
      if (!transaction) throw new NotFoundException('Transaction not found!');

      transaction.totalAmount = purchase.finalAmount;
      transaction.status = this.transactionService.getTransactionStatus(
        transaction.paidAmount,
        transaction.totalAmount,
      );

      // Update purchase status if it is completed
      purchase.status =
        purchase.status === SourceStatus.COMPLETED
          ? SourceStatus.PROCESSING
          : purchase.status;

      await queryRunner.manager.save(transaction);
      await queryRunner.manager.save(purchase);
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

  async removeItem(purchaseId: number, itemId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const purchase = await queryRunner.manager.findOne(Purchase, {
      where: {
        id: purchaseId,
        status: Not(SourceStatus.CANCELLED),
      },
    });

    if (!purchase) throw new NotFoundException('Purchase not found!');

    const item = await queryRunner.manager.findOne(Item, {
      where: {
        id: itemId,
        sourceId: purchaseId,
        sourceType: SourceType.PURCHASE,
        isActive: true,
      },
    });

    if (!item) throw new NotFoundException('Item not found!');

    try {
      // Update item information
      item.isActive = false;
      item.adjustmentType = AdjustmentType.REMOVE;

      await queryRunner.manager.save(item);

      // Update item purchase
      purchase.quantity -= item.quantity;
      purchase.totalAmount -= item.finalAmount;
      purchase.finalAmount = purchase.totalAmount - purchase.discountAmount;

      // Update transaction
      const transaction = await queryRunner.manager.findOne(Transaction, {
        where: { sourceId: purchaseId, sourceType: SourceType.PURCHASE },
        select: ['id', 'totalAmount', 'paidAmount', 'status'],
      });
      if (!transaction) throw new NotFoundException('Transaction not found!');

      transaction.totalAmount = purchase.finalAmount;

      transaction.status = this.transactionService.getTransactionStatus(
        transaction.paidAmount,
        transaction.totalAmount,
      );

      await queryRunner.manager.save(transaction);

      purchase.status = await this.itemService.getSourceStatus(
        purchaseId,
        SourceType.PURCHASE,
        queryRunner.manager,
        transaction.status,
      );

      await queryRunner.manager.save(purchase);
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
