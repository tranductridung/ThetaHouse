import { forwardRef, Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';
import { ProductModule } from 'src/product/product.module';
import { ItemModule } from 'src/item/item.module';
import { ConsigmentModule } from 'src/consignment/consigment.module';
import { AuthorizationModule } from 'src/authorization/authorization.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inventory]),
    ProductModule,
    ItemModule,
    AuthorizationModule,
    forwardRef(() => ConsigmentModule),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
