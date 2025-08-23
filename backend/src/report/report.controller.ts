import { Controller, Get } from '@nestjs/common';
import { ReportService } from './report.service';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}
  @Get('financial')
  getFinancialReport() {
    return this.reportService.getFinancialReport();
  }

  @Get('inventory')
  getInventoryReport() {
    return this.reportService.getInventoryReport();
  }
}
