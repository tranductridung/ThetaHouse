import { PaginationDto } from './../common/dtos/pagination.dto';
import {
  ConsignmentType,
  InventoryAction,
  ItemableType,
  ItemStatus,
  SourceType,
} from 'src/common/enums/enum';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from 'src/item/entities/item.entity';
import { User } from 'src/user/entities/user.entity';
import { Inventory } from './entities/inventory.entity';
import { Product } from 'src/product/entities/product.entity';
import { DataSource, Repository, EntityManager } from 'typeorm';
import { ConsignmentService } from './../consignment/consigment.service';
import { CreateItemInventoryDto } from './dto/create-item-inventory.dto';
import { CreateAdjustInventoryDto } from './dto/create-adjust-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory) private inventoryRepo: Repository<Inventory>,
    private dataSource: DataSource,

    @Inject(forwardRef(() => ConsignmentService))
    private consignmentService: ConsignmentService,
  ) {}

  // Get action of item form source information
  async getActionOfItem(sourceType: SourceType, sourceId: number) {
    switch (sourceType) {
      case SourceType.ORDER:
        return InventoryAction.EXPORT;
      case SourceType.PURCHASE:
        return InventoryAction.IMPORT;
      default: {
        const consignment = await this.consignmentService.findOne(sourceId);

        return consignment.type === ConsignmentType.IN
          ? InventoryAction.IMPORT
          : InventoryAction.EXPORT;
      }
    }
  }

  async createInventoryForItem(
    item: Item,
    creatorId: number,
    manager: EntityManager,
    quantity?: number,
  ) {
    // Check if item is product
    if (item.itemableType !== ItemableType.PRODUCT)
      throw new BadRequestException(
        'Cannot create inventory for item which is not product!',
      );

    // Check if item is imported/exported
    if (
      item.status === ItemStatus.IMPORTED ||
      item.status === ItemStatus.EXPORTED
    )
      throw new BadRequestException(`Item is ${item.status}!`);

    const action = await this.getActionOfItem(item.sourceType, item.sourceId);

    // Count how many product this item is handled
    const quantityAlreadyHandled = await this.countInvenQuantity(
      item.id,
      action,
    );
    const remainQuantity = item.quantity - quantityAlreadyHandled;

    if (remainQuantity < 0)
      throw new BadRequestException(
        `Item is ${action} exceed quantity of product. Please try again!`,
      );
    else if (remainQuantity === 0)
      throw new BadRequestException(`Item is ${action}!`);

    // Check if quantity is valid.
    // If quantity is greater than remainQuantity => invalid
    if (quantity && quantity > remainQuantity)
      throw new BadRequestException(
        'Quantity is greater than remain quantity of item!',
      );

    const finalQuantity = quantity ? quantity : remainQuantity;

    const createItemInventoryDto: CreateItemInventoryDto = {
      action,
      quantity: finalQuantity,
      note: `${action} ${finalQuantity} product for item ${item.id} of ${item.sourceType}!`,
      productId: item.itemableId,
      itemId: item.id,
      unitPrice: item.unitPrice,
    };

    // Find product
    const product = await manager.findOneOrFail(Product, {
      where: { id: createItemInventoryDto.productId },
    });

    // Updated stock in product
    switch (createItemInventoryDto.action) {
      case InventoryAction.EXPORT:
        if (product.reserved < createItemInventoryDto.quantity) {
          throw new BadRequestException(
            'The quantity is greater than product reserved!',
          );
        }
        product.reserved -= createItemInventoryDto.quantity;
        break;
      case InventoryAction.IMPORT:
        product.quantity += createItemInventoryDto.quantity;
        break;
    }

    await manager.save(product);

    // Create inventory
    const inventory = manager.create(Inventory, createItemInventoryDto);

    inventory.product = product;
    inventory.creator = await manager.findOneByOrFail(User, {
      id: creatorId,
    });

    // Add item to inventory
    inventory.item = item;

    await manager.save(inventory);

    // Total quantity = handled + inventory handle
    const totalQuantity = inventory.quantity + quantityAlreadyHandled;
    if (totalQuantity === item.quantity)
      item.status =
        action === InventoryAction.IMPORT
          ? ItemStatus.IMPORTED
          : ItemStatus.EXPORTED;
    else if (totalQuantity < item.quantity) item.status = ItemStatus.PARTIAL;
    else
      throw new BadRequestException(
        'Total of inventory quantity and handled quantity is greater than item quantity!',
      );
    await manager.save(item);

    return inventory;
  }

  async createAdjustInventory(
    createAdjustInventoryDto: CreateAdjustInventoryDto,
    creatorId: number,
  ) {
    const validAction = [
      InventoryAction.ADJUST_MINUS,
      InventoryAction.ADJUST_PLUS,
    ];
    if (!validAction.includes(createAdjustInventoryDto.action))
      throw new BadRequestException(
        'Use Adjust-Minus or Adjust-Plus for Action to adjust product!',
      );

    // Create queryRunner to implement transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let inventory: Inventory;
    try {
      // Find product
      const product = await queryRunner.manager.findOne(Product, {
        where: { id: createAdjustInventoryDto.productId },
      });
      if (!product) throw new NotFoundException('Product not found!');

      // Updated stock in product
      switch (createAdjustInventoryDto.action) {
        case InventoryAction.ADJUST_MINUS:
          if (createAdjustInventoryDto.quantity > product.quantity)
            throw new BadRequestException(
              'The quantity is greater than product quantity!',
            );
          product.quantity -= createAdjustInventoryDto.quantity;
          break;
        case InventoryAction.ADJUST_PLUS:
          product.quantity += createAdjustInventoryDto.quantity;
          break;
      }
      await queryRunner.manager.save(product);

      // Create inventory
      inventory = queryRunner.manager.create(
        Inventory,
        createAdjustInventoryDto,
      );

      inventory.product = product;
      inventory.creator = await queryRunner.manager.findOneByOrFail(User, {
        id: creatorId,
      });

      await queryRunner.manager.save(inventory);

      // Commit transaction
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw error;
    } finally {
      await queryRunner.release();
    }
    return inventory;
  }

  async findAll(paginationDto?: PaginationDto) {
    const queryBuilder = this.inventoryRepo
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.product', 'product')
      .leftJoinAndSelect('inventory.item', 'item')
      .leftJoinAndSelect('inventory.creator', 'creator')
      .select([
        'inventory.id',
        'inventory.quantity',
        'inventory.action',
        'inventory.createdAt',
        'inventory.note',
        'creator.fullName',
        'product.name',
        'product.unit',
        'product.defaultOrderPrice',
        'product.defaultPurchasePrice',
        'item.id',
      ])
      .orderBy('inventory.createdAt', 'DESC');

    if (
      paginationDto?.page !== undefined &&
      paginationDto?.limit !== undefined
    ) {
      const { page, limit } = paginationDto;

      const [inventories, total] = await queryBuilder
        .skip(page * limit)
        .take(limit)
        .getManyAndCount();

      return { inventories, total };
    } else {
      const inventories = await queryBuilder.getMany();
      return inventories;
    }
  }

  async findOneFull(id: number) {
    const inventory = await this.inventoryRepo.findOne({
      where: { id },
      relations: ['product', 'item', 'creator'],
    });

    if (!inventory) throw new NotFoundException('Inventory not found!');
    return inventory;
  }

  async findOne(id: number) {
    const inventory = await this.inventoryRepo.findOneBy({ id });

    if (!inventory) throw new NotFoundException('Inventory not found!');
    return inventory;
  }

  async findInventoryFull(id: number) {
    const inventory = await this.inventoryRepo.findOne({
      where: { id },
      relations: ['product', 'item', 'creator'],
    });

    return inventory;
  }

  async findInventory(id: number) {
    const inventory = await this.inventoryRepo.findOneBy({ id });

    return inventory;
  }

  async countInvenQuantity(itemId: number, action: InventoryAction) {
    const result: { sum: string | null } | undefined = await this.inventoryRepo
      .createQueryBuilder('inventory')
      .select('SUM(inventory.quantity)', 'sum')
      .where('inventory.action = :action', { action })
      .andWhere('inventory.itemId = :itemId', { itemId })
      .getRawOne();

    return result?.sum ? Number(result.sum) : 0;
  }
}
