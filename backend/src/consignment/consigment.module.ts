import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemModule } from 'src/item/item.module';
import { TransactionModule } from 'src/transaction/transaction.module';
import { InventoryModule } from 'src/inventory/inventory.module';
import { Consignment } from './entities/consigment.entity';
import { ConsignmentController } from './consigment.controller';
import { ConsignmentService } from './consigment.service';
import { AuthorizationModule } from 'src/authorization/authorization.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Consignment]),
    ItemModule,
    TransactionModule,
    AuthorizationModule,
    forwardRef(() => InventoryModule),
  ],
  controllers: [ConsignmentController],
  providers: [ConsignmentService],
  exports: [ConsignmentService],
})
export class ConsigmentModule {}
