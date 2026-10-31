import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ConsignmentService } from './consigment.service';
import { Consignment } from './entities/consigment.entity';
import { ConsignmentController } from './consigment.controller';
import { InventoryModule } from 'src/inventory/inventory.module';
import { TransactionModule } from 'src/transaction/transaction.module';
import { AuthorizationModule } from 'src/authorization/authorization.module';
import { ItemModule } from '../item/item.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Consignment]),
    TransactionModule,
    AuthorizationModule,
    ItemModule,
    InventoryModule,
  ],
  controllers: [ConsignmentController],
  providers: [ConsignmentService],
  exports: [ConsignmentService],
})
export class ConsigmentModule {}
