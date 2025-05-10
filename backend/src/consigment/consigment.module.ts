import { forwardRef, Module } from '@nestjs/common';
import { ConsigmentService } from './consigment.service';
import { ConsigmentController } from './consigment.controller';
import { Consigment } from './entities/consigment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemModule } from 'src/item/item.module';
import { TransactionModule } from 'src/transaction/transaction.module';
import { InventoryModule } from 'src/inventory/inventory.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Consigment]),
    ItemModule,
    TransactionModule,
    forwardRef(() => InventoryModule),
  ],
  controllers: [ConsigmentController],
  providers: [ConsigmentService],
  exports: [ConsigmentService],
})
export class ConsigmentModule {}
