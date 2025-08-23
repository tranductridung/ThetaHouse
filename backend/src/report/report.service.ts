import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionType } from 'src/common/enums/enum';
import { Product } from 'src/product/entities/product.entity';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,

    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async getFinancialReport(from?: Date, to?: Date) {
    if (!from || !to) return;

    // ------------------------------ NET REVENUE ------------------------------
    const netRevenue = (await this.transactionRepo
      .createQueryBuilder('transaction')
      .select('SUM(transaction.totalAmount)', 'total')
      .where('transaction.type = :type', { type: TransactionType.INCOME })
      .andWhere('transaction.createdAt BETWEEN :from AND :to', { from, to })
      .getRawOne()) as { total: string | null };

    // ------------------------------ COGS (Cost of Goods Sold) ------------------------------
    const cogs = (await this.transactionRepo
      .createQueryBuilder('transaction')
      .select('SUM(transaction.totalAmount)', 'total')
      .where('transaction.type = :type', { type: TransactionType.EXPENSE })
      .andWhere('transaction.createdAt BETWEEN :from AND :to', { from, to })
      .getRawOne()) as { total: string | null };

    // ------------------------------ GROSS PROFIT ------------------------------
    const grossProfit =
      Number(netRevenue?.total || 0) - Number(cogs?.total || 0);

    return {
      message: 'Financial report generated',
      period: { from, to },
      netRevenue: Number(netRevenue?.total) || 0,
      cogs: Number(cogs?.total) || 0,
      grossProfit,
    };
  }

  getInventoryReport() {
    // Logic to generate inventory report
    return { message: 'Inventory report generated' };
  }
}
