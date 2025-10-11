import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { AuthorizationModule } from 'src/authorization/authorization.module';

@Module({
  imports: [AuthorizationModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
