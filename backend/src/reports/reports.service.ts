import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ReportsService {
  constructor(private dataSource: DataSource) {}
  revenueSummary() {
    return 'revenueSummary';
  }
  revenueByProduct() {
    return 'revenueByProduct';
  }
  revenueByCustomer() {
    return 'revenueByCustomer';
  }
  expenseSummary() {
    return 'expenseSummary';
  }
  profitLoss() {
    return 'profitLoss';
  }
  profitLossMonthly() {
    return 'profitLossMonthly';
  }
  profitMarginByProduct() {
    return 'profitMarginByProduct';
  }
  castflowSummary() {
    return 'castflowSummary';
  }
  castflowBalance() {
    return 'castflowBalance';
  }
  debtReceivable() {
    return 'debtReceivable';
  }
  debtPayable() {
    return 'debtPayable';
  }
  debtAging() {
    return 'debtAging';
  }
  debtSummary() {
    return 'debtSummary';
  }
}
