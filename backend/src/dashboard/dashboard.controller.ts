import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';

@UseGuards(AuthJwtGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  async getSummary(@Query('from') from?: string, @Query('to') to?: string) {
    return this.dashboardService.summary(from, to);
  }

  @Get('source-summary')
  async getTotalSource(@Query('from') from?: string, @Query('to') to?: string) {
    return this.dashboardService.getSourceSummary(from, to);
  }

  @Get('product-summary')
  async getProductSummary() {
    return this.dashboardService.getProductSummary();
  }

  @Get('inventory-summary')
  async getInventorySummary(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.dashboardService.getInventorySummary(from, to);
  }

  @Get('trends')
  async getTrends() {
    return this.dashboardService.getTrends();
  }
}
