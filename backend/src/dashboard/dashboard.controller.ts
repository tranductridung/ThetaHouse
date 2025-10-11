import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { PermissionsGuard } from 'src/authorization/guards/permission.guard';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';

@UseGuards(AuthJwtGuard, PermissionsGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @RequirePermissions('dashboard:read')
  @Get('summary')
  async getSummary(@Query('from') from?: string, @Query('to') to?: string) {
    return this.dashboardService.summary(from, to);
  }

  @RequirePermissions('dashboard:read')
  @Get('source-summary')
  async getTotalSource(@Query('from') from?: string, @Query('to') to?: string) {
    return this.dashboardService.getSourceSummary(from, to);
  }

  @RequirePermissions('dashboard:read')
  @Get('product-summary')
  async getProductSummary() {
    return this.dashboardService.getProductSummary();
  }

  @RequirePermissions('dashboard:read')
  @Get('inventory-summary')
  async getInventorySummary(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.dashboardService.getInventorySummary(from, to);
  }

  @RequirePermissions('dashboard:read')
  @Get('trends')
  async getTrends() {
    return this.dashboardService.getTrends();
  }
}
