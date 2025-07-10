import { PaginationDto } from './../common/dtos/pagination.dto';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DataSource,
  EntityManager,
  FindOptionsWhere,
  In,
  Not,
  Repository,
} from 'typeorm';
import {
  AdjustmentType,
  ConsignmentType,
  DiscountType,
  ItemableType,
  ItemStatus,
  SourceStatus,
  SourceType,
  TransactionStatus,
} from 'src/common/enums/enum';
import { Item } from './entities/item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { loadItemable } from './helpers/itemable.helper';
import { SnapshotType } from 'src/common/types/item.types';
import { Service } from 'src/service/entities/service.entity';
import { DiscountService } from 'src/discount/discount.service';
import { loadEntitySource, loadSource } from './helpers/source.helper';
import { AppointmentService } from 'src/appointment/appointment.service';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { Consignment } from 'src/consignment/entities/consigment.entity';
@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item) private itemRepo: Repository<Item>,
    private discountService: DiscountService,
    @Inject(forwardRef(() => AppointmentService))
    private appointmentService: AppointmentService,
    private dataSource: DataSource,
  ) {}

  async add(
    createItemDto: CreateItemDto,
    sourceId: number,
    sourceType: SourceType,
    manager?: EntityManager,
    adjustmentType?: AdjustmentType,
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

    // Check source by loadSource func
    await loadSource(sourceId, sourceType, manager ?? this.dataSource);

    // Check if item is exist
    const existItem = await repo.findOne({
      where: {
        itemableId: createItemDto.itemableId,
        itemableType: createItemDto.itemableType,
        sourceId,
        sourceType,
        isActive: true,
      },
    });

    // Update quantity
    const updatedQuantity = existItem
      ? createItemDto.quantity + existItem.quantity
      : createItemDto.quantity;

    // Calculate totalAmount and finalAmount
    const totalAmount = createItemDto.unitPrice * updatedQuantity;

    const finalAmount = await this.calculateDiscountAmount(
      totalAmount,
      createItemDto.discountId,
    );

    // Create snapshot
    let snapshotData: SnapshotType | undefined = undefined;

    if (createItemDto.itemableType === ItemableType.SERVICE) {
      snapshotData = {
        duration: (itemable as Service).duration,
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
        adjustmentType,
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

  async findAll(paginationDto?: PaginationDto) {
    const queryBuilder = this.itemRepo
      .createQueryBuilder('item')
      .orderBy('item.createdAt', 'DESC');

    if (
      paginationDto?.page !== undefined &&
      paginationDto?.limit !== undefined
    ) {
      const { page, limit } = paginationDto;

      const [items, total] = await queryBuilder
        .skip(page * limit)
        .take(limit)
        .getManyAndCount();

      return { items, total };
    } else {
      const items = await queryBuilder.getMany();
      return items;
    }
  }

  async findAllActive(paginationDto?: PaginationDto) {
    const queryBuilder = this.itemRepo
      .createQueryBuilder('item')
      .where('item.isActive = :isActive', { isActive: true })
      .orderBy('item.createdAt', 'DESC');

    if (
      paginationDto?.page !== undefined &&
      paginationDto?.limit !== undefined
    ) {
      const { page, limit } = paginationDto;

      const [items, total] = await queryBuilder
        .skip(page * limit)
        .take(limit)
        .getManyAndCount();

      return { items, total };
    } else {
      const items = await queryBuilder.getMany();
      return items;
    }
  }

  // Get item without itemable and source.
  async findOne(id: number, checkActive?: boolean) {
    const item = await this.itemRepo.findOneBy({ id });

    if (!item) throw new NotFoundException('Item not found!');

    if (checkActive && !item.isActive)
      throw new BadRequestException('Item is cancelled!');

    return item;
  }

  // Get full item with itemable and source.
  async findOneFull(id: number, checkActive?: boolean) {
    const item = await this.findOne(id, checkActive);

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

    return await this.itemRepo.find({
      where,
    });
  }

  async update(
    id: number,
    updateItemDto: UpdateItemDto,
    manager?: EntityManager,
  ) {
    const repo = manager ? manager.getRepository(Item) : this.itemRepo;

    const item = await repo.findOne({
      where: {
        id,
        isActive: true,
      },
    });

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
    const item = await this.findOne(id, true);

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

  async calculateDiscountAmount(totalAmount: number, discountId?: number) {
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

        finalAmount -= discountAmount;
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

  async disableItemOfSource(
    sourceId: number,
    sourceType: SourceType,
    manager: EntityManager,
  ) {
    const items = await manager.update(
      Item,
      { sourceId, sourceType, isActive: true },
      { isActive: false, adjustmentType: AdjustmentType.CANCELLED },
    );

    return { items };
  }

  // Get completed status of item by source type
  // Return: IMPORTED or EXPORTED
  getItemStatusBySource(sourceType: SourceType, type?: ConsignmentType) {
    let status: ItemStatus;

    if (sourceType === SourceType.CONSIGNMENT) {
      if (!type)
        throw new BadRequestException(
          'Type is required to get status of consignment!',
        );

      status =
        type === ConsignmentType.IN ? ItemStatus.IMPORTED : ItemStatus.EXPORTED;
    } else
      status =
        sourceType === SourceType.PURCHASE
          ? ItemStatus.IMPORTED
          : ItemStatus.EXPORTED;

    return status;
  }

  // Check product item is handled or not (handle may be import or export)
  async isAllProductItemHandled(
    sourceId: number,
    sourceType: SourceType,
    manager: EntityManager,
  ): Promise<boolean> {
    let status: ItemStatus;

    const repo = manager.getRepository(Item);

    if (sourceType === SourceType.CONSIGNMENT) {
      const consignment = await manager.findOne(Consignment, {
        where: { id: sourceId },
        select: ['id', 'type'],
      });
      console.log(consignment);
      status = this.getItemStatusBySource(sourceType, consignment?.type);
    } else status = this.getItemStatusBySource(sourceType);

    const count = await repo.count({
      where: {
        sourceId,
        sourceType,
        itemableType: ItemableType.PRODUCT,
        isActive: true,
        status: Not(status),
      },
    });

    return count === 0;
  }

  async isAllServiceItemCompleted(orderId: number, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Item) : this.itemRepo;
    const items = await repo.find({
      where: {
        sourceId: orderId,
        sourceType: SourceType.ORDER,
        itemableType: ItemableType.SERVICE,
        isActive: true,
      },
      select: ['id', 'snapshotData', 'quantity'],
    });

    for (const item of items) {
      const isItemCompleted =
        await this.appointmentService.isServiceItemCompleted(
          item.id,
          Number(item.snapshotData?.session),
          Number(item.snapshotData?.bonusSession),
          item.quantity,
          manager,
        );

      console.log('isItemCompleted', isItemCompleted);

      if (!isItemCompleted) return false;
    }

    return true;
  }

  async getSourceStatus(
    sourceId: number,
    sourceType: SourceType,
    manager: EntityManager,
    transactionStatus?: TransactionStatus,
  ) {
    if (!transactionStatus) {
      const transaction = await manager.findOne(Transaction, {
        where: {
          sourceId,
          sourceType,
        },
        select: ['id', 'status'],
      });

      if (!transaction) throw new NotFoundException('Transaction not found!');
      transactionStatus = transaction.status;
    }

    console.log('function is order compeleted');
    const entity = await loadSource(sourceId, sourceType, manager);
    const repo = manager.getRepository(entity.constructor);

    const isSourceExist = await repo.exists({
      where: { id: sourceId, status: Not(SourceStatus.CANCELLED) },
    });

    if (!isSourceExist) throw new NotFoundException(`${sourceType} not found!`);

    // Is status of transaction paid or not
    console.log('transactionStatus:', transactionStatus);
    const isPaid =
      transactionStatus === TransactionStatus.PAID ||
      transactionStatus === TransactionStatus.OVERPAID;

    //  Is all product completed or not
    const isProductsCompleted = await this.isAllProductItemHandled(
      sourceId,
      sourceType,
      manager,
    );
    console.log('isProductsCompleted:', isProductsCompleted);

    //  Is all service completed or not
    const isServicesCompleted = await this.isAllServiceItemCompleted(
      sourceId,
      manager,
    );
    console.log('isServicesCompleted:', isServicesCompleted);
    console.log(isPaid, isProductsCompleted, isServicesCompleted);

    if (isPaid && isProductsCompleted && isServicesCompleted)
      return SourceStatus.COMPLETED;
    else if (!isPaid && !isProductsCompleted && !isServicesCompleted)
      return SourceStatus.CONFIRMED;
    return SourceStatus.PROCESSING;
  }

  async updateSourceStatus(
    sourceId: number,
    sourceType: SourceType,
    manager: EntityManager,
    status?: TransactionStatus,
  ) {
    // Get repo of entity: Order, Purchase, Consignment
    const entity = loadEntitySource(sourceType);
    const repo = manager.getRepository(entity);

    const sourceStatus = await this.getSourceStatus(
      sourceId,
      sourceType,
      manager,
      status,
    );

    await repo.update(sourceId, { status: sourceStatus });
  }
}
