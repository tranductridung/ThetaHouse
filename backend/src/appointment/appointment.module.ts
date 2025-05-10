import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemModule } from 'src/item/item.module';
import { forwardRef, Module } from '@nestjs/common';
import { PartnerModule } from 'src/partner/partner.module';
import { AppointmentService } from './appointment.service';
import { Appointment } from './entities/appointment.entity';
import { AppointmentController } from './appointment.controller';
import { UserModule } from 'src/user/user.module';
import { RoomModule } from 'src/room/room.module';
import { ModulesModule } from 'src/modules/modules.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment]),
    ItemModule,
    UserModule,
    RoomModule,
    ModulesModule,
    forwardRef(() => PartnerModule),
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService],
})
export class AppointmentModule {}
