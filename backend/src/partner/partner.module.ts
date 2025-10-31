import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnerService } from './partner.service';
import { forwardRef, Module } from '@nestjs/common';
import { Partner } from './entities/partner.entity';
import { PartnerController } from './partner.controller';
import { AppointmentModule } from 'src/appointment/appointment.module';
import { AuthorizationModule } from 'src/authorization/authorization.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Partner]),
    forwardRef(() => AppointmentModule),
    AuthorizationModule,
  ],
  controllers: [PartnerController],
  providers: [PartnerService],
  exports: [PartnerService],
})
export class PartnerModule {}
