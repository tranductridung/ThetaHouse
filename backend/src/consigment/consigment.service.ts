import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Item } from 'src/item/entities/item.entity';
import { Consigment } from './entities/consigment.entity';
import { Product } from 'src/product/entities/product.entity';
import { Partner } from 'src/partner/entities/partner.entity';
import { CreateConsigmentDto } from './dto/create-consigment.dto';
import { InventoryService } from 'src/inventory/inventory.service';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { SourceType, TransactionType } from 'src/common/enums/enum';
import { TransactionService } from 'src/transaction/transaction.service';
import { CreateTransactionDto } from 'src/transaction/dto/create-transaction.dto';
import {
  ConsigmentType,
  InventoryAction,
  ItemableType,
  ItemStatus,
  PartnerType,
} from './../common/enums/enum';
import { ItemService } from 'src/item/item.service';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class ConsigmentService {
  constructor(
    @InjectRepository(Consigment)
    private consigmentRepo: Repository<Consigment>,
    private dataSource: DataSource,
    private itemService: ItemService,
    private transactionService: TransactionService,

    @Inject(forwardRef(() => InventoryService))
    private inventoryService: InventoryService,
  ) {}

  async create(createConsigmentDto: CreateConsigmentDto, creatorId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const consigment = queryRunner.manager.create(Consigment, {
      ...createConsigmentDto,
      quantity: 0,
      totalAmount: 0,
      finalAmount: 0,
    });
    consigment.creator = await queryRunner.manager.findOneByOrFail(User, {
      id: creatorId,
    });

    const type =
      createConsigmentDto.type === ConsigmentType.IN
        ? PartnerType.SUPPLIER
        : PartnerType.CUSTOMER;

    consigment.partner = await queryRunner.manager.findOneOrFail(Partner, {
      where: {
        id: createConsigmentDto.partnerId,
        type,
      },
    });
    await queryRunner.manager.save(consigment);

    let totalAmount = 0;
    let consigmentQuantity = 0;
    try {
      for (const item of createConsigmentDto.items) {
        if (item.itemableType !== ItemableType.PRODUCT)
          throw new BadRequestException('ItemableType is not valid!');

        const itemResult = await this.itemService.add(
          item,
          consigment.id,
          SourceType.CONSIGMENT,
          queryRunner.manager,
        );
        totalAmount += itemResult.finalAmount;
        consigmentQuantity += itemResult.quantity;
      }

      // Update quantity and reversed of product
      if (consigment.type === ConsigmentType.OUT) {
        const itemResults = await queryRunner.manager.find(Item, {
          where: {
            sourceId: consigment.id,
            sourceType: SourceType.CONSIGMENT,
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
      if (createConsigmentDto.commissionRate) {
        finalAmount =
          totalAmount -
          (createConsigmentDto.commissionRate * totalAmount) / 100;
      }

      queryRunner.manager.merge(Consigment, consigment, {
        quantity: consigmentQuantity,
        totalAmount,
        finalAmount,
      });
      await queryRunner.manager.save(consigment);

      // Create transaction
      const createTransactionDto: CreateTransactionDto = {
        type:
          consigment.type === ConsigmentType.IN
            ? TransactionType.INCOME
            : TransactionType.EXPENSE,
        sourceType: SourceType.CONSIGMENT,
        sourceId: consigment.id,
        totalAmount: finalAmount,
        note: `Transaction of consigment ${consigment.id}`,
      };

      await this.transactionService.create(
        createTransactionDto,
        creatorId,
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();
      return consigment;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return this.consigmentRepo.find();
  }

  async findOneFull(id: number) {
    const consigment = await this.consigmentRepo.findOne({
      where: { id },
      relations: ['creator', 'partner'],
    });

    if (!consigment) throw new NotFoundException('Consigment not found!');

    const items = await this.itemService.findItemsBySource(
      consigment.id,
      SourceType.CONSIGMENT,
      ItemableType.PRODUCT,
    );

    return { ...consigment, items: items };
  }

  async findOne(id: number) {
    const consigment = await this.consigmentRepo.findOneBy({ id });

    if (!consigment) throw new NotFoundException('Consigment not found!');
    return consigment;
  }

  async handledItem(itemId: number, creatorId: number) {
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

      item.status =
        inventory.action === InventoryAction.IMPORT
          ? ItemStatus.IMPORTED
          : ItemStatus.EXPORTED;

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

  async handleConsigment(consigmentId: number, creatorId: number) {
    const consigment = await this.findOneFull(consigmentId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // Find list item which is not exported/imported
    const itemsNotExported = await this.itemService.findItemsBySource(
      consigment.id,
      SourceType.CONSIGMENT,
      ItemableType.PRODUCT,
      ItemStatus.NONE,
    );

    if (itemsNotExported.length === 0)
      return { message: 'All item of consigment is exported!' };

    const itemInventories: Inventory[] = [];

    try {
      for (const item of itemsNotExported) {
        const itemInventory =
          await this.inventoryService.createInventoryForItem(
            item,
            creatorId,
            queryRunner.manager,
          );

        item.status =
          itemInventory.action === InventoryAction.IMPORT
            ? ItemStatus.IMPORTED
            : ItemStatus.EXPORTED;
        await queryRunner.manager.save(item);

        itemInventories.push({
          ...itemInventory,
          item,
        });
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
