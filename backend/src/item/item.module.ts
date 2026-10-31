import { ItemService } from './item.service';
import { Item } from './entities/item.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemController } from './item.controller';
import { forwardRef, Module } from '@nestjs/common';
import { DiscountModule } from 'src/discount/discount.module';
import { EnrollmentModule } from 'src/enrollment/enrollment.module';
import { AppointmentModule } from 'src/appointment/appointment.module';
import { AuthorizationModule } from 'src/authorization/authorization.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Item]),
    DiscountModule,
    EnrollmentModule,
    AuthorizationModule,
    InventoryModule,
    forwardRef(() => AppointmentModule),
  ],
  controllers: [ItemController],
  providers: [ItemService],
  exports: [ItemService],
})
export class ItemModule {}
