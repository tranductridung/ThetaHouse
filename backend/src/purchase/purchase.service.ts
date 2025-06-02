import { ItemService } from 'src/item/item.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Purchase } from './entities/purchase.entity';
import { DataSource, Repository } from 'typeorm';
import {
  ItemableType,
  ItemStatus,
  PartnerType,
  SourceType,
  TransactionType,
} from 'src/common/enums/enum';
import { Partner } from 'src/partner/entities/partner.entity';
import { User } from 'src/user/entities/user.entity';
import { TransactionService } from 'src/transaction/transaction.service';
import { CreateTransactionDto } from 'src/transaction/dto/create-transaction.dto';
import { InventoryService } from 'src/inventory/inventory.service';
import { Inventory } from 'src/inventory/entities/inventory.entity';

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
        );
        totalAmount += itemResult.finalAmount;
        purchaseQuantity += itemResult.quantity;
      }

      const finalAmount = createPurchaseDto.discountAmount
        ? totalAmount - createPurchaseDto.discountAmount
        : totalAmount;

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
        note: `Transaction of purchase ${purchase.id}`,
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

  async findAll() {
    return await this.purchaseRepo
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
        'creator.fullName',
        'supplier.fullName',
      ])
      .getMany();
  }

  async findOneFull(id: number) {
    const purchase = await this.purchaseRepo.findOne({
      where: { id },
      relations: ['creator'],
    });

    if (!purchase) throw new NotFoundException('Purchase not found!');

    const items = await this.itemService.findItemsBySource(
      purchase.id,
      SourceType.PURCHASE,
      ItemableType.PRODUCT,
    );

    return { ...purchase, items: items };
  }

  async findOne(id: number) {
    const purchase = await this.purchaseRepo.findOneBy({ id });

    if (!purchase) throw new NotFoundException('Purchase not found!');

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

      await queryRunner.manager.save(item);

      await queryRunner.commitTransaction();
      return {
        ...inventory,
        item,
      };
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async importPurchase(purchaseId: number, creatorId: number) {
    const purchase = await this.findOneFull(purchaseId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // Find list item which is not imported
    const itemsNotImported = await this.itemService.findItemsBySource(
      purchase.id,
      SourceType.PURCHASE,
      ItemableType.PRODUCT,
      [ItemStatus.NONE, ItemStatus.PARTIAL],
    );

    if (itemsNotImported.length === 0)
      return { message: 'All item of purchase is im   ported!' };

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
