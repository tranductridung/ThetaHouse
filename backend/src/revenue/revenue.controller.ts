import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { RevenueService } from './revenue.service';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PermissionsGuard } from 'src/authorization/guards/permission.guard';
@UseGuards(AuthJwtGuard, PermissionsGuard)
@Controller('revenues')
export class RevenueController {
  constructor(private readonly revenueService: RevenueService) {}

  @Get()
  async getTotalRevenue() {
    const revenue = await this.revenueService.getTotalRevenue();
    return { revenue };
  }

  @Get('source')
  async getSourceTotal() {
    const sourceTotal = await this.revenueService.getNotCompletedSource();
    return { sourceTotal };
  }

  @Get('product')
  async getProduct() {
    const product = await this.revenueService.getProduct();
    return { product };
  }

  @Get('chart')
  async getRevenueChart(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.revenueService.getRevenueChart(startDate, endDate);
  }
}
