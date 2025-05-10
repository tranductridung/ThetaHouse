import { ConsigmentService } from './../consigment/consigment.service';
import { InjectRepository } from '@nestjs/typeorm';
import { ItemService } from 'src/item/item.service';
import { User } from 'src/user/entities/user.entity';
import { Inventory } from './entities/inventory.entity';
import { Product } from 'src/product/entities/product.entity';
import { DataSource, Repository, EntityManager } from 'typeorm';
import {
  ConsigmentType,
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
import { Item } from 'src/item/entities/item.entity';
import { CreateItemInventoryDto } from './dto/create-item-inventory.dto';
import { CreateAdjustInventoryDto } from './dto/create-adjust-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory) private inventoryRepo: Repository<Inventory>,
    private itemService: ItemService,
    private dataSource: DataSource,

    @Inject(forwardRef(() => ConsigmentService))
    private consigmentService: ConsigmentService,
  ) {}

  async getActionOfItem(sourceType: SourceType, sourceId: number) {
    switch (sourceType) {
      case SourceType.ORDER:
        return InventoryAction.EXPORT;
      case SourceType.PURCHASE:
        return InventoryAction.IMPORT;
      default: {
        const consigment = await this.consigmentService.findOne(sourceId);

        return consigment.type === ConsigmentType.IN
          ? InventoryAction.IMPORT
          : InventoryAction.EXPORT;
      }
    }
  }

  async createInventoryForItem(
    item: Item,
    creatorId: number,
    manager: EntityManager,
  ) {
    // Check if item is product
    if (item.itemableType !== ItemableType.PRODUCT)
      throw new BadRequestException(
        'Cannot create inventory for item which is not product!',
      );

    const action = await this.getActionOfItem(item.sourceType, item.sourceId);
    const createItemInventoryDto: CreateItemInventoryDto = {
      action,
      quantity: item.quantity,
      note: `${action} product for item ${item.id} of ${item.sourceType}!`,
      productId: item.itemableId,
      itemId: item.id,
    };

    const validAction = [InventoryAction.EXPORT, InventoryAction.IMPORT];
    if (!validAction.includes(createItemInventoryDto.action))
      throw new BadRequestException(
        `${createItemInventoryDto.action} is not valid to create inventory for item!`,
      );

    const productItem = await this.itemService.findItem(
      createItemInventoryDto.itemId,
      ItemableType.PRODUCT,
    );

    // Return message if item is exported/imported
    if (productItem && productItem.status !== ItemStatus.NONE)
      throw new BadRequestException(`Item is ${productItem.status}!`);

    // Find product
    const product = await manager.findOneOrFail(Product, {
      where: { id: createItemInventoryDto.productId },
    });

    // Updated stock in product
    switch (createItemInventoryDto.action) {
      case InventoryAction.EXPORT:
        if (product.reserved < createItemInventoryDto.quantity) {
          throw new BadRequestException(
            'The quantity is greater than product reserved',
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
    if (productItem) inventory.item = productItem;

    await manager.save(inventory);

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

  async findAll() {
    return await this.inventoryRepo.find();
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
}
