import { UpdateItemDto } from './dto/update-item.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from './entities/item.entity';
import {
  DataSource,
  EntityManager,
  FindOptionsWhere,
  In,
  Repository,
} from 'typeorm';
import { loadItemable } from './helpers/itemable.helper';
import { loadSource } from './helpers/source.helper';
import { DiscountService } from 'src/discount/discount.service';
import {
  AdjustmentType,
  DiscountType,
  ItemableType,
  ItemStatus,
  SourceType,
} from 'src/common/enums/enum';
import { Product } from 'src/product/entities/product.entity';
import { Service } from 'src/service/entities/service.entity';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item) private itemRepo: Repository<Item>,
    private discountService: DiscountService,
    private dataSource: DataSource,
  ) {}

  async add(
    createItemDto: CreateItemDto,
    sourceId: number,
    sourceType: SourceType,
    manager?: EntityManager,
  ) {
    const repo = manager ? manager.getRepository(Item) : this.itemRepo;

    if (sourceType !== SourceType.ORDER && createItemDto.discountId)
      throw new BadRequestException(
        'Cannot use discount for item of source which is not order!',
      );

    // Load itemable
    const itemable = await loadItemable(
      createItemDto.itemableId,
      createItemDto.itemableType,
      this.dataSource,
    );

    // Load source
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const source = await loadSource(
      sourceId,
      sourceType,
      manager ?? this.dataSource,
    );

    // Check if item is exist
    const existItem = await repo.findOne({
      where: {
        itemableId: createItemDto.itemableId,
        itemableType: createItemDto.itemableType,
        sourceId,
        sourceType,
      },
    });

    // Update quantity
    const updatedQuantity = existItem
      ? createItemDto.quantity + existItem.quantity
      : createItemDto.quantity;

    // Calculate totalAmount and finalAmount
    const totalAmount = itemable.unitPrice * updatedQuantity;

    const finalAmount = await this.calculateDiscountAmount(
      totalAmount,
      updatedQuantity,
      createItemDto.discountId,
    );

    // Create snapshot
    let snapshotData = {};
    if (createItemDto.itemableType === ItemableType.PRODUCT) {
      snapshotData = {
        unitPrice: (itemable as Product).unitPrice,
      };
    } else {
      snapshotData = {
        duration: (itemable as Service).duration,
        unitPrice: (itemable as Service).unitPrice,
        session: (itemable as Service).session,
        bonusSession: (itemable as Service).bonusSession,
      };
    }

    // If item is exist => update
    // else => create
    if (existItem) {
      repo.merge(existItem, {
        quantity: updatedQuantity,
        totalAmount,
        finalAmount,
      });
      return await repo.save(existItem);
    } else {
      const item = repo.create({
        ...createItemDto,
        sourceId,
        sourceType,
        quantity: updatedQuantity,
        snapshotData,
        totalAmount,
        finalAmount,
      });
      return await repo.save(item);
    }
  }

  async findAll() {
    return await this.itemRepo.find();
  }

  // Get item without itemable and source.
  async findOne(id: number) {
    const item = await this.itemRepo.findOneBy({ id });
    if (!item) throw new NotFoundException('Item not found!');
    return item;
  }

  // Get full item with itemable and source.
  async findOneFull(id: number) {
    const item = await this.findOne(id);

    const itemable = await loadItemable(
      item.itemableId,
      item.itemableType,
      this.dataSource,
    );
    const source = await loadSource(
      item.sourceId,
      item.sourceType,
      this.dataSource,
    );

    return {
      ...item,
      itemable,
      source,
    };
  }

  // Get item but not throw error if not found
  async findItem(
    id: number,
    itemableType?: ItemableType,
    status?: ItemStatus,
    isActive?: boolean,
  ) {
    return await this.itemRepo.findOne({
      where: {
        id,
        itemableType,
        status,
        isActive,
      },
    });
  }

  async findItemsBySource(
    sourceId: number,
    sourceType: SourceType,
    itemableType?: ItemableType,
    status?: ItemStatus[],
    isActive?: boolean,
  ) {
    const where: FindOptionsWhere<Item> = {
      sourceId,
      sourceType,
    };

    if (status && status.length > 0) {
      where.status = In(status);
    }

    if (itemableType) {
      where.itemableType = itemableType;
    }

    if (isActive) {
      where.isActive = isActive;
    }

    return await this.itemRepo.find({ where });
  }

  async update(
    id: number,
    updateItemDto: UpdateItemDto,
    manager?: EntityManager,
  ) {
    const repo = manager ? manager.getRepository(Item) : this.itemRepo;

    const item = await repo.findOneBy({ id });

    if (!item) throw new NotFoundException('Item not found!');

    if (item.itemableType === ItemableType.PRODUCT) {
      if (updateItemDto.quantity !== item.quantity)
        item.status = ItemStatus.PARTIAL;
    }

    repo.merge(item, updateItemDto);
    await repo.save(item);
    return { item };
  }

  async transferService(id: number) {
    const item = await this.findOne(id);

    if (item.itemableType !== ItemableType.SERVICE)
      throw new BadRequestException(
        'Cannot transfer item which is not service!',
      );

    if (item.status === ItemStatus.TRANSFERED)
      return { message: 'Item service is transfered!' };

    item.status = ItemStatus.TRANSFERED;

    await this.itemRepo.save(item);

    return { message: 'Service is transfered!' };
  }

  async calculateDiscountAmount(
    totalAmount: number,
    quantity: number = 1,
    discountId?: number,
  ) {
    let finalAmount = totalAmount;

    // Calculate finalAmount by totalAmount and discount (if item has discount)
    if (discountId) {
      // Get discount
      const discount =
        await this.discountService.getActiveDiscountValue(discountId);
      // Calculate discount amount
      if (!discount.minTotalValue || totalAmount >= discount.minTotalValue) {
        let discountAmount =
          discount.type === DiscountType.PERCENTAGE
            ? (totalAmount * discount.value) / 100
            : discount.value;

        if (
          discount.maxDiscountAmount &&
          discountAmount > discount.maxDiscountAmount
        ) {
          discountAmount = discount.maxDiscountAmount;
        }

        finalAmount -= discountAmount * quantity;
      }
    }
    return finalAmount;
  }

  isProduct(items: CreateItemDto[]) {
    const hasInvalid = items.some(
      (item) => item.itemableType !== ItemableType.PRODUCT,
    );

    if (hasInvalid)
      throw new BadRequestException(`Some items are not PRODUCT type!`);
  }

  async cancelSource(
    sourceId: number,
    sourceType: SourceType,
    manager?: EntityManager,
  ) {
    const repo = manager ? manager.getRepository(Item) : this.itemRepo;

    const result = await repo.update(
      { sourceId, sourceType },
      { adjustmentType: AdjustmentType.CANCELLED },
    );

    return { result };
  }
}
