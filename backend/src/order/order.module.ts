import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Discount } from 'src/discount/entities/discount.entity';
import { Partner } from 'src/partner/entities/partner.entity';
import { User } from 'src/user/entities/user.entity';
import { ItemModule } from 'src/item/item.module';
import { InventoryModule } from 'src/inventory/inventory.module';
import { TransactionModule } from 'src/transaction/transaction.module';
import { OrderService } from './order.service';
import { EnrollmentModule } from 'src/enrollment/enrollment.module';
import { AuthorizationModule } from 'src/authorization/authorization.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Discount, Partner, User]),
    ItemModule,
    InventoryModule,
    TransactionModule,
    EnrollmentModule,
    AuthorizationModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
