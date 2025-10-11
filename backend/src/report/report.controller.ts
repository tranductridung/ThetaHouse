import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { PermissionsGuard } from 'src/authorization/guards/permission.guard';
@UseGuards(AuthJwtGuard, PermissionsGuard)
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}
  @Get('pnl')
  getPnl(@Query('from') from: string, @Query('to') to: string) {
    return this.reportService.pnl(new Date(from), new Date(to));
  }
}
