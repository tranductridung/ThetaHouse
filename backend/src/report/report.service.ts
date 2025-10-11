import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ConsignmentType,
  InventoryAction,
  SourceStatus,
  SourceType,
  TransactionType,
} from 'src/common/enums/enum';
import { Consignment } from 'src/consignment/entities/consigment.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { Product } from 'src/product/entities/product.entity';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class ReportService {
  constructor(private dataSource: DataSource) {}
  async pnl(from: Date, to: Date) {
    if (from >= to)
      throw new BadRequestException(
        "'From' date must be earlier than 'To' date",
      );
    // ====================================== Revenue ======================================
    let qb = this.dataSource
      .createQueryBuilder(Transaction, 't')
      .select('SUM(t.totalAmount)', 'orderTotalAmount')
      .where('t.type = :type', { type: TransactionType.INCOME })
      .andWhere('t.createdAt BETWEEN :from AND :to', { from, to })
      .andWhere('t.sourceType = :sourceType', {
        sourceType: SourceType.ORDER,
      });

    const revenueOrder = await qb.getRawOne<{ orderTotalAmount: string }>();

    qb = this.dataSource
      .createQueryBuilder(Transaction, 't')
      .innerJoin(Consignment, 'c', 'c.id = t.sourceId')
      .select('SUM(t.totalAmount)', 'total')
      .where('t.type = :type', { type: TransactionType.INCOME })
      .andWhere('c.status != :cancel', { cancel: SourceStatus.CANCELLED })
      .andWhere('t.sourceType = :sourceType', {
        sourceType: SourceType.CONSIGNMENT,
      })
      .andWhere('t.createdAt BETWEEN :from AND :to', { from, to })
      .andWhere('c.type = :consignmentType', {
        consignmentType: ConsignmentType.OUT,
      });

    const revenueConsignment = await qb.getRawOne<{
      consignmentTotalAmount: string;
    }>();

    const revenue =
      Number(revenueOrder?.orderTotalAmount ?? 0) +
      Number(revenueConsignment?.consignmentTotalAmount ?? 0);

    // ====================================== COGS ======================================
    // COGS = BeginningInventory * avgCost
    //        + purchase * price of purchase
    //        - Ending Inventory * avgCost
    // => COGS = (BeginningInventory - Ending Inventory ) * avgCost
    //           + purchase * price of purchase
    const beginningInventory = await this.dataSource
      .createQueryBuilder(Inventory, 'i')
      .leftJoin(Product, 'p', 'p.id = i.product.id')
      .select(['i.product.id', 'productId', 'p.name'])
      .addSelect(
        `
          COALESCE(SUM(
            CASE
              WHEN i.action IN (:...importTypes) THEN i.quantity * p.avgCost
              WHEN i.action IN (:...exportTypes) THEN -i.quantity * p.avgCost
              ELSE 0
            END
          ), 0)
        `,
        'beginningValue',
      )
      .where('i.createdAt < :from', { from })
      .setParameters({
        importTypes: [InventoryAction.IMPORT, InventoryAction.ADJUST_PLUS],
        exportTypes: [InventoryAction.EXPORT, InventoryAction.ADJUST_MINUS],
      })
      .groupBy('i.product.id')
      .getRawMany<{ productId: number; beginningValue: string }>();

    const endingInventory = await this.dataSource
      .createQueryBuilder(Inventory, 'i')
      .leftJoin(Product, 'p', 'p.id = i.product.id')
      .select(['i.product.id', 'productId', 'p.name'])
      .addSelect(
        `
          COALESCE(SUM(
            CASE
              WHEN i.action IN (:...importTypes) THEN i.quantity * p.avgCost
              WHEN i.action IN (:...exportTypes) THEN -i.quantity * p.avgCost
              ELSE 0
            END
          ), 0)
        `,
        'endingValue',
      )
      .where('i.createdAt > :to', { to })
      .setParameters({
        importTypes: [InventoryAction.IMPORT, InventoryAction.ADJUST_PLUS],
        exportTypes: [InventoryAction.EXPORT, InventoryAction.ADJUST_MINUS],
      })
      .groupBy('i.product.id')
      .getRawMany<{ productId: number; endingValue: string }>();

    const purchaseInventory = await this.dataSource
      .createQueryBuilder(Inventory, 'i')
      .select(
        `
      COALESCE(SUM(
        CASE
          WHEN i.action = :importTypes THEN i.quantity * i.unitPrice
          WHEN i.action = :exportTypes THEN -i.quantity * i.unitPrice
          ELSE 0
        END
      ), 0)
    `,
        'purchaseValue',
      )
      .where('i.createdAt BETWEEN :from AND :to', { from, to })
      .setParameters({
        importTypes: InventoryAction.IMPORT,
        exportTypes: InventoryAction.EXPORT,
      })
      .getRawOne<{ purchaseValue: string }>();

    const cogs =
      beginningInventory.reduce((total, item) => {
        total += Number(item.beginningValue);
        return total;
      }, 0) -
      endingInventory.reduce((total, item) => {
        total += Number(item.endingValue);
        return total;
      }, 0) +
      Number(purchaseInventory?.purchaseValue ?? 0);

    // o	Gross Profit
    const grossProfit = revenue - cogs;
    // o	Chi phí (Expenses)
    // o	Lợi nhuận ròng

    return {
      revenue,
      cogs,
      grossProfit,
    };
  }
  async balanceSheet() {}
  async cashflow(from: Date, to: Date) {
    if (from >= to)
      throw new BadRequestException(
        "'From' date must be earlier than 'To' date",
      );

    // const {income, outcome} = await this.dataSource.createQueryBuilder(Transaction, 't')
    // .select('SUM(t.totalAmount)', 'income')
    // .where('t.createdAt BETWEEN :from AND :to', { from, to })
    // .andWhere('t.')
  }
  async inventory() {}
  async summary() {}
}
