import { Injectable } from '@nestjs/common';
import {
  CommonStatus,
  ConsignmentType,
  InventoryAction,
  SourceStatus,
} from 'src/common/enums/enum';
import { Consignment } from 'src/consignment/entities/consigment.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { Order } from 'src/order/entities/order.entity';
import { Product } from 'src/product/entities/product.entity';
import { Purchase } from 'src/purchase/entities/purchase.entity';

import { DataSource } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(private dataSource: DataSource) {}

  getPeriod(from?: string, to?: string) {
    const periodFrom =
      from ??
      new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1,
      ).toISOString();
    const periodTo = to ?? new Date().toISOString();
    console.log(periodFrom, periodTo);
    return { periodFrom, periodTo };
  }

  async summary(from?: string, to?: string) {
    const { periodFrom, periodTo } = this.getPeriod(from, to);
    const [{ total_income }]: [{ total_income: number }] =
      await this.dataSource.query(
        `
  SELECT COALESCE(SUM(t.amount), 0) AS total_income
  FROM (
    SELECT o.finalAmount AS amount
    FROM \`order\` o
    WHERE o.status <> ?
      AND o.createdAt BETWEEN ? AND ?

    UNION ALL

    SELECT c.finalAmount
    FROM consignment c
    WHERE c.status <> ?
      AND c.createdAt BETWEEN ? AND ?
      AND c.type = ?
  ) t
  `,
        [
          SourceStatus.CANCELLED,
          periodFrom,
          periodTo,
          SourceStatus.CANCELLED,
          periodFrom,
          periodTo,
          ConsignmentType.OUT,
        ],
      );

    const [{ total_expense }]: [{ total_expense: number }] =
      await this.dataSource.query(
        `
  SELECT COALESCE(SUM(t.amount), 0) AS total_expense
  FROM (
    SELECT p.finalAmount AS amount
    FROM purchase p
    WHERE p.status <> ?
      AND p.createdAt BETWEEN ? AND ?

    UNION ALL

    SELECT c.finalAmount
    FROM consignment c
    WHERE c.status <> ?
      AND c.createdAt BETWEEN ? AND ?
      AND c.type = ?
  ) t
  `,
        [
          SourceStatus.CANCELLED,
          periodFrom,
          periodTo,
          SourceStatus.CANCELLED,
          periodFrom,
          periodTo,
          ConsignmentType.OUT,
        ],
      );

    // /** 4. Công nợ phải thu */
    const rawIn = await this.dataSource
      .createQueryBuilder(Consignment, 'c')
      .select('COALESCE(SUM(c.finalAmount), 0)', 'totalConsignmentIn')
      .where('c.type = :type', { type: ConsignmentType.IN })
      .andWhere('c.createdAt BETWEEN :periodFrom AND :periodTo ', {
        periodFrom: periodFrom,
        periodTo: periodTo,
      })
      .andWhere('c.status != :status', { status: SourceStatus.CANCELLED })
      .getRawOne<{ totalConsignmentIn: string }>();

    const rawOut = await this.dataSource
      .createQueryBuilder(Consignment, 'c')
      .select('COALESCE(SUM(c.finalAmount), 0)', 'totalConsignmentOut')
      .where('c.type = :type', { type: ConsignmentType.OUT })
      .andWhere('c.createdAt BETWEEN :periodFrom AND :periodTo ', {
        periodFrom: periodFrom,
        periodTo: periodTo,
      })
      .andWhere('c.status != :status', { status: SourceStatus.CANCELLED })
      .getRawOne<{ totalConsignmentOut: string }>();

    return {
      period: { from: periodFrom, to: periodTo },

      totalIncome: Number(total_income),
      totalExpense: Number(total_expense),
      totalConsignmentIn: Number(rawIn?.totalConsignmentIn ?? 0),
      totalConsignmentOut: Number(rawOut?.totalConsignmentOut ?? 0),
      profit: Number(total_income) - Number(total_expense),
    };
  }

  async getSourceSummary(from?: string, to?: string) {
    const { periodFrom, periodTo } = this.getPeriod(from, to);

    // Helper
    const countBy = (entity: any, completed: boolean) =>
      this.dataSource
        .createQueryBuilder(entity, 'e')
        .where(completed ? 'e.status = :st' : 'e.status <> :st', {
          st: completed ? SourceStatus.COMPLETED : SourceStatus.CANCELLED,
        })
        .andWhere('e.createdAt BETWEEN :from AND :to', {
          from: periodFrom,
          to: periodTo,
        })
        .getCount();

    const [
      orderTotal,
      purchaseTotal,
      consignmentTotal,

      orderCompleted,
      purchaseCompleted,
      consignmentCompleted,
    ] = await Promise.all([
      countBy(Order, false),
      countBy(Purchase, false),
      countBy(Consignment, false),

      countBy(Order, true),
      countBy(Purchase, true),
      countBy(Consignment, true),
    ]);

    return {
      period: { from: periodFrom, to: periodTo },

      total: {
        order: orderTotal,
        purchase: purchaseTotal,
        consignment: consignmentTotal,
        grand: orderTotal + purchaseTotal + consignmentTotal,
      },

      completed: {
        order: orderCompleted,
        purchase: purchaseCompleted,
        consignment: consignmentCompleted,
        grand: orderCompleted + purchaseCompleted + consignmentCompleted,
      },
    };
  }

  async getProductSummary() {
    // Helper
    const countBy = (status: CommonStatus) => {
      const selects = [
        'SUM(p.defaultOrderPrice * p.reserved) AS reservedValue',
        'SUM(p.reserved) AS reservedQuantity',
        'SUM(p.defaultOrderPrice * p.quantity) AS value',
        'SUM(p.quantity) AS quantity',
      ];

      return this.dataSource
        .createQueryBuilder(Product, 'p')
        .select(selects)
        .where('p.status = :status', { status })
        .getRawOne<{
          value: string;
          quantity: string;
          reservedValue: string;
          reservedQuantity: string;
        }>();
    };
    const [activeProduct, inactiveProduct] = await Promise.all([
      countBy(CommonStatus.ACTIVE),
      countBy(CommonStatus.INACTIVE),
    ]);

    return { activeProduct, inactiveProduct };
  }

  async getInventorySummary(from?: string, to?: string) {
    const { periodFrom, periodTo } = this.getPeriod(from, to);

    const rawImport = await this.dataSource
      .createQueryBuilder(Inventory, 'i')
      .select('SUM(i.quantity) AS total')
      .where('i.action = :import OR i.action = :adjustPlus', {
        import: InventoryAction.IMPORT,
        adjustPlus: InventoryAction.ADJUST_PLUS,
      })
      .andWhere('i.createdAt BETWEEN :periodFrom AND :periodTo', {
        periodFrom,
        periodTo,
      })
      .getRawOne<{ total: string }>();

    const rawExport = await this.dataSource
      .createQueryBuilder(Inventory, 'i')
      .select('SUM(i.quantity) AS total')
      .where('i.action = :export OR i.action = :adjustMinus', {
        export: InventoryAction.EXPORT,
        adjustMinus: InventoryAction.ADJUST_MINUS,
      })
      .getRawOne<{ total: string }>();

    return {
      importTotal: Number(rawImport?.total ?? 0),
      exportTotal: Number(rawExport?.total ?? 0),
    };
  }

  // async getTrends(from?: string, to?: string, interval: string = 'day') {
  async getTrends(from?: string, to?: string) {
    const { periodFrom, periodTo } = this.getPeriod(from, to);
    return (
      this.dataSource
        .createQueryBuilder(Order, 'o')
        // .where('o.createdAt BETWEEN :periodFrom AND :periodTo', {
        //   periodFrom,
        //   periodTo,
        // })
        .select('DATE(o.createdAt)', 'date')
        .addSelect('SUM(o.finalAmount)', 'total')
        .groupBy('DATE(o.createdAt)')
        .orderBy('DATE(o.createdAt)', 'ASC')
        .getRawMany()
    );
  }
}
