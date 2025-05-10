import { forwardRef, Module } from '@nestjs/common';
import { PartnerService } from './partner.service';
import { PartnerController } from './partner.controller';
import { Partner } from './entities/partner.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentModule } from 'src/appointment/appointment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Partner]),
    forwardRef(() => AppointmentModule),
  ],
  controllers: [PartnerController],
  providers: [PartnerService],
  exports: [PartnerService],
})
export class PartnerModule {}
