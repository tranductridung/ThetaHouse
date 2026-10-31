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
  UserStatus,
} from 'src/common/enums/enum';
import { Item } from './entities/item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateItemDto } from './dto/create-item.dto';
import { User } from 'src/user/entities/user.entity';
import { loadItemable } from './helpers/itemable.helper';
import { SnapshotType } from 'src/common/types/item.types';
import { Service } from 'src/service/entities/service.entity';
import { DiscountService } from 'src/discount/discount.service';
import { EnrollmentService } from 'src/enrollment/enrollment.service';
import { loadEntitySource, loadSource } from './helpers/source.helper';
import { AppointmentService } from 'src/appointment/appointment.service';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { Consignment } from 'src/consignment/entities/consigment.entity';
import { InventoryService } from '../inventory/inventory.service';
@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item) private itemRepo: Repository<Item>,
    private discountService: DiscountService,
    @Inject(forwardRef(() => AppointmentService))
    private appointmentService: AppointmentService,
    private enrollmentService: EnrollmentService,
    private inventoryService: InventoryService,
    private dataSource: DataSource,
  ) {}

  async add(
    createItemDto: CreateItemDto,
    creatorId: number,
    sourceId: number,
    sourceType: SourceType,
    manager: EntityManager,
    currentCustomerId?: number,
    changeCourse?: boolean,
  ) {
    const repo = manager.getRepository(Item);

    if (sourceType !== SourceType.ORDER && createItemDto.discountId)
      throw new BadRequestException(
        `Cannot use discount for item of ${sourceType} which is not order!`,
      );

    // Load itemable to verify itemable exist or not
    const itemable = await loadItemable(
      createItemDto.itemableId,
      createItemDto.itemableType,
      manager,
    );

    // Load source to verify source exist or not
    await loadSource(sourceId, sourceType, manager);

    // Check if item exist or not
    const existingItem = await repo.findOne({
      where: {
        itemableId: createItemDto.itemableId,
        itemableType: createItemDto.itemableType,
        sourceId,
        sourceType,
        isActive: true,
      },
    });

    const adjustmentType = existingItem
      ? AdjustmentType.ADD
      : AdjustmentType.INIT;

    const changedQuantity = createItemDto.quantity;
    const totalAmount = createItemDto.unitPrice * changedQuantity;

    const finalAmount = await this.calculateDiscountAmount(
      totalAmount,
      createItemDto.discountId,
    );

    // Snapshot cho service
    let snapshotData: SnapshotType | undefined = undefined;
    if (createItemDto.itemableType === ItemableType.SERVICE) {
      const svc = itemable as Service;
      snapshotData = {
        duration: svc.duration,
        session: svc.session,
        bonusSession: svc.bonusSession,
      };
    }

    const item = repo.create({
      ...createItemDto,
      quantity: changedQuantity,
      sourceId,
      sourceType,
      snapshotData,
      currentCustomerId,
      totalAmount,
      finalAmount,
      adjustmentType,
    });

    const creator = await manager.findOne(User, {
      where: {
        id: creatorId,
        status: UserStatus.ACTIVE,
      },
    });
    if (!creator) throw new NotFoundException('User not found!');

    item.creator = creator;

    if (changeCourse) {
      item.isActive = false;
      item.status = ItemStatus.CHANGED;
    }

    await repo.save(item);

    if (!changeCourse && createItemDto.itemableType === ItemableType.COURSE)
      await this.enrollmentService.createForItem(item.id, manager);

    return item;
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
  async findOne(id: number, checkActive?: boolean, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Item) : this.itemRepo;

    const item = await repo.findOneBy({ id });

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

  async transferService(
    itemId: number,
    orderId: number,
    newCustomerId: number,
    manager: EntityManager,
  ) {
    const repo = manager.getRepository(Item);

    const item = await repo.findOne({
      where: {
        id: itemId,
        sourceId: orderId,
        sourceType: SourceType.ORDER,
        isActive: true,
      },
    });

    if (!item) throw new NotFoundException('Item not found!');

    if (item.itemableType !== ItemableType.SERVICE)
      throw new BadRequestException(
        'Cannot transfer item which is not service!',
      );

    if (newCustomerId === item.currentCustomerId) {
      throw new BadRequestException('Cannot transfer for current customer!');
    }

    item.status = ItemStatus.TRANSFERED;
    item.currentCustomerId = newCustomerId;

    await repo.save(item);

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

    return finalAmount >= 0 ? finalAmount : 0;
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

    const entity = await loadSource(sourceId, sourceType, manager);
    const repo = manager.getRepository(entity.constructor);

    const isSourceExist = await repo.exists({
      where: { id: sourceId, status: Not(SourceStatus.CANCELLED) },
    });

    if (!isSourceExist) throw new NotFoundException(`${sourceType} not found!`);

    // Is status of transaction paid or not
    const isPaid =
      transactionStatus === TransactionStatus.PAID ||
      transactionStatus === TransactionStatus.OVERPAID;

    //  Is all product completed or not
    const isProductsCompleted = await this.isAllProductItemHandled(
      sourceId,
      sourceType,
      manager,
    );

    //  Is all service completed or not
    const isServicesCompleted = await this.isAllServiceItemCompleted(
      sourceId,
      manager,
    );

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

  async calculateSourceAmountAndQty(
    sourceId: number,
    sourceType: SourceType,
    manager: EntityManager,
  ) {
    const totalAmount = await manager.sum(Item, 'finalAmount', {
      sourceId,
      sourceType,
      isActive: true,
      adjustmentType: Not(
        In([AdjustmentType.CANCELLED, AdjustmentType.REMOVE]),
      ),
    });

    const quantity = await manager.sum(Item, 'quantity', {
      sourceId,
      sourceType,
      isActive: true,
      adjustmentType: Not(
        In([AdjustmentType.CANCELLED, AdjustmentType.REMOVE]),
      ),
    });

    return {
      totalAmount: Number(totalAmount ?? 0),
      quantity: Number(quantity ?? 0),
    };
  }

  async recalculateItem(item: Item, manager: EntityManager) {
    const { quantity, unitPrice } = item;
    item.totalAmount = quantity * unitPrice;
    item.finalAmount = await this.calculateDiscountAmount(
      item.totalAmount,
      item?.discount?.id,
    );

    await manager.save(item);
    return item;
  }

  // Calculate the remain quantity of source which has not been handle (import/export)
  async getRemainQuantityOfSource(sourceId: number, sourceType: SourceType) {
    const items = await this.findItemsBySource(
      sourceId,
      sourceType,
      ItemableType.PRODUCT,
      [ItemStatus.NONE, ItemStatus.PARTIAL],
      true,
    );

    // Get status of item from sourceType and sourceId
    let consignmentType: ConsignmentType | undefined = undefined;
    if (sourceType === SourceType.CONSIGNMENT) {
      const consignment = await this.dataSource
        .createQueryBuilder(Consignment, 'c')
        .where('c.id =:consignmentId', { consignmentId: sourceId })
        .getOne();

      if (!consignment) throw new NotFoundException('Consignment not found!');

      consignmentType = consignment?.type;
    }

    const itemStatus = this.getItemStatusBySource(sourceType, consignmentType);

    // Get inventory action from sourceType and sourceId
    const itemAction = await this.inventoryService.getActionOfItem(
      sourceType,
      sourceId,
    );

    const result: { itemId: number; unprocessedQuantity: number }[] = [];

    for (const item of items) {
      let unprocessedQuantity = 0;

      if (item.status !== itemStatus) {
        const processedQuantity =
          await this.inventoryService.countInvenQuantity(item.id, itemAction);
        unprocessedQuantity = item.quantity - processedQuantity;
      }
      result.push({ itemId: item.id, unprocessedQuantity });
    }

    return Array.from(result);
  }

  async getRemainQuantityOfItem(
    sourceId: number,
    sourceType: SourceType,
    itemId: number,
  ) {
    const item = await this.dataSource
      .createQueryBuilder(Item, 'i')
      .where('i.id = :itemId', { itemId })
      .andWhere('i.sourceId = :sourceId AND i.sourceType = :sourceType', {
        sourceId,
        sourceType,
      })
      .andWhere('i.itemableType = :itemableType', {
        itemableType: ItemableType.PRODUCT,
      })
      .andWhere('i.isActive = :isActive', { isActive: true })
      .getOne();

    if (!item) throw new NotFoundException('Item not found!');

    // Get status of item from sourceType and sourceId
    let consignmentType: ConsignmentType | undefined = undefined;

    if (sourceType === SourceType.CONSIGNMENT) {
      const consignment = await this.dataSource
        .createQueryBuilder(Consignment, 'c')
        .where('c.id = :consignmentId', { consignmentId: sourceId })
        .getOne();
      if (!consignment) throw new NotFoundException('Consignment not found!');

      consignmentType = consignment?.type;
    }

    const itemStatus = this.getItemStatusBySource(sourceType, consignmentType);

    // Get inventory action from sourceType and sourceId
    const itemAction = await this.inventoryService.getActionOfItem(
      sourceType,
      sourceId,
    );

    let unprocessedQuantity = 0;

    if (item.status !== itemStatus) {
      const processedQuantity = await this.inventoryService.countInvenQuantity(
        item.id,
        itemAction,
      );
      unprocessedQuantity = item.quantity - processedQuantity;
    }

    return { unprocessedQuantity };
  }

  async checkHandledOfSource(sourceId: number, sourceType: SourceType) {
    const action = await this.inventoryService.getActionOfItem(
      sourceType,
      sourceId,
    );

    const results = await this.itemRepo
      .createQueryBuilder('item')
      .leftJoin('item.inventories', 'inventory', 'inventory.action = :action', {
        action,
      })
      .select('item.id', 'itemId')
      .addSelect('item.quantity', 'totalQuantity')
      .addSelect('item.itemableId', 'itemableId')
      .addSelect('SUM(inventory.quantity)', 'handledQuantity')
      .where('item.itemableType = :itemableType', {
        itemableType: ItemableType.PRODUCT,
      })
      .andWhere('item.isActive = :isActive', { isActive: true })
      .andWhere('item.sourceId = :sourceId', { sourceId })
      .andWhere('item.sourceType = :sourceType', { sourceType })
      .groupBy('item.id')
      .getRawMany<{
        itemId: number;
        itemableId: number;
        totalQuantity: number;
        handledQuantity: number;
      }>();

    // Use Promise.all to wait all async
    const finalResults = await Promise.all(
      results.map(async (r) => {
        const product = await loadItemable(
          Number(r.itemableId),
          ItemableType.PRODUCT,
          this.dataSource,
        );

        const handledQuantity = Number(r.handledQuantity || 0);
        const totalQuantity = Number(r.totalQuantity || 0);

        if (handledQuantity !== totalQuantity)
          return {
            itemId: r.itemId,
            productName: product.name,
            handledQuantity,
            totalQuantity,
          };
      }),
    );

    return finalResults;
  }

  // Attach the status (isALlExported, isAllImported, isAllHandled) to sources
  async enrichSourcesWithHandleStatus<T extends { id: number }>(
    sources: T[],
    sourceType: SourceType,
  ) {
    const title =
      sourceType === SourceType.ORDER
        ? 'isAllExported'
        : sourceType === SourceType.PURCHASE
          ? 'isAllImported'
          : 'isAllHandled';

    const results = await Promise.all(
      sources.map(async (source) => {
        const sourceId = Number(source.id);

        if (isNaN(sourceId)) {
          throw new Error(`Invalid source id: ${source.id}`);
        }

        const isAllHanlded = await this.isAllProductItemHandled(
          sourceId,
          sourceType,
          this.dataSource.manager,
        );

        return {
          ...source,
          [title]: isAllHanlded,
        };
      }),
    );

    return results;
  }
}
