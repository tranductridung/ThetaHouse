import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { AuthorizationModule } from 'src/authorization/authorization.module';

@Module({
  imports: [AuthorizationModule],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
