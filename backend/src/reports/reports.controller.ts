import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';

@UseGuards(AuthJwtGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // Finance report endpoint
  @Get('finance/revenue/summary')
  revenueSummary() {
    return this.reportsService.revenueSummary();
  }

  @Get('finance/  revenue/by-product')
  revenueByProduct() {
    return this.reportsService.revenueByProduct();
  }

  @Get('finance/revenue/by-customer')
  revenueByCustomer() {
    return this.reportsService.revenueByCustomer();
  }

  @Get('finance/expense/summary')
  expenseSummary() {
    return this.reportsService.expenseSummary();
  }

  @Get('finance/profit-loss')
  profitLoss() {
    return this.reportsService.profitLoss();
  }

  @Get('finance/profit-loss/monthly')
  profitLossMonthly() {
    return this.reportsService.profitLossMonthly();
  }

  @Get('finance/profit-margin/by-product')
  profitMarginByProduct() {
    return this.reportsService.profitMarginByProduct();
  }

  // Castflow report endpoint
  @Get('castflow/summary')
  castflowSummary() {
    return this.reportsService.castflowSummary();
  }

  @Get('castflow/balance')
  castflowBalance() {
    return this.reportsService.castflowBalance();
  }

  // Debt report endpoint
  @Get('debt/receivable')
  debtReceivable() {
    return this.reportsService.debtReceivable();
  }

  @Get('debt/payable')
  debtPayable() {
    return this.reportsService.debtPayable();
  }

  @Get('debt/aging')
  debtAging() {
    return this.reportsService.debtAging();
  }

  @Get('debt/summary')
  debtSummary() {
    return this.reportsService.debtSummary();
  }
}
