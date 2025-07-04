import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { SourceStatus, TransactionType } from 'src/common/enums/enum';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { Order } from 'src/order/entities/order.entity';
import { Consignment } from 'src/consignment/entities/consigment.entity';
import { Purchase } from 'src/purchase/entities/purchase.entity';
import { Product } from 'src/product/entities/product.entity';

export interface TotalResult {
  totalAmount: string | number | null;
  paidAmount: string | number | null;
}

@Injectable()
export class RevenueService {
  constructor(private dataSource: DataSource) {}

  async getTotalRevenue() {
    const expense = await this.dataSource
      .createQueryBuilder(Transaction, 'transaction')
      .select([
        'SUM(transaction.totalAmount) AS totalAmount',
        'SUM(transaction.paidAmount) AS paidAmount',
      ])
      .where('transaction.type = :type', { type: TransactionType.EXPENSE })
      .getRawOne<TotalResult>();

    const income = await this.dataSource
      .createQueryBuilder(Transaction, 'transaction')
      .select([
        'SUM(transaction.totalAmount) AS totalAmount',
        'SUM(transaction.paidAmount) AS paidAmount',
      ])
      .where('transaction.type = :type', { type: TransactionType.INCOME })
      .getRawOne<TotalResult>();

    return { income, expense };
  }

  async getNotCompletedSource() {
    const orderTotal = await this.dataSource
      .createQueryBuilder(Order, 'order')
      .where('order.status = :status1 OR order.status = :status2', {
        status1: SourceStatus.CONFIRMED,
        status2: SourceStatus.PROCESSING,
      })
      .getCount();

    const purchaseTotal = await this.dataSource
      .createQueryBuilder(Purchase, 'purchase')
      .where('purchase.status = :status1 OR purchase.status = :status2', {
        status1: SourceStatus.CONFIRMED,
        status2: SourceStatus.PROCESSING,
      })
      .getCount();

    const consignmentTotal = await this.dataSource
      .createQueryBuilder(Consignment, 'consignment')
      .where('consignment.status = :status1 OR consignment.status = :status2', {
        status1: SourceStatus.CONFIRMED,
        status2: SourceStatus.PROCESSING,
      })
      .getCount();

    return { orderTotal, purchaseTotal, consignmentTotal };
  }

  async getProduct() {
    const runOutSoonProduct = await this.dataSource
      .createQueryBuilder(Product, 'product')
      .where('product.quantity < 10')
      .getCount();

    const runOutProduct = await this.dataSource
      .createQueryBuilder(Product, 'product')
      .where('product.quantity = 0')
      .getCount();
    return { runOutSoonProduct, runOutProduct };
  }

  async getRevenueChart(startDate: string, endDate: string) {
    const result = await this.dataSource
      .createQueryBuilder(Transaction, 'transaction')
      .select('DATE(transaction.createdAt)', 'date')
      .addSelect(
        `SUM(CASE WHEN transaction.type = '${TransactionType.INCOME}' THEN transaction.totalAmount ELSE 0 END)`,
        'income',
      )
      .addSelect(
        `SUM(CASE WHEN transaction.type = '${TransactionType.EXPENSE}' THEN transaction.totalAmount ELSE 0 END)`,
        'expense',
      )
      .where('transaction.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('DATE(transaction.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    // Optional: convert string -> number
    return result.map((row) => ({
      date: row.date,
      income: Number(row.income),
      expense: Number(row.expense),
    }));
  }
}

// Tổng doanh thu (Doanh thu đã thu)
// Tổng chi phí (Chi ra từ giao dịch mua/chi)
// Công nợ khách hàng (số tiền còn phải thu)
// Số lượng đơn hàng đang xử lý

// Tình trạng hàng tồn kho (sản phẩm sắp hết hàng)
// Số đơn hàng mới hôm nay / tuần này
// Cảnh báo đơn hàng trễ / chậm xử lý
