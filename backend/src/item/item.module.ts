import { forwardRef, Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { Item } from './entities/item.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscountModule } from 'src/discount/discount.module';
import { AppointmentModule } from 'src/appointment/appointment.module';
import { EnrollmentModule } from 'src/enrollment/enrollment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Item]),
    DiscountModule,
    EnrollmentModule,
    forwardRef(() => AppointmentModule),
  ],
  controllers: [ItemController],
  providers: [ItemService],
  exports: [ItemService],
})
export class ItemModule {}
