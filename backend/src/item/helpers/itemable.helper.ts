import { DataSource } from 'typeorm';
import { CommonStatus, ItemableType } from 'src/common/enums/enum';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Service } from 'src/service/entities/service.entity';
import { Product } from 'src/product/entities/product.entity';

export const ItemableEntityMap = {
  [ItemableType.SERVICE]: Service,
  [ItemableType.PRODUCT]: Product,
};

export async function loadItemable(
  itemableId: number,
  itemableType: ItemableType,
  dataSource: DataSource,
): Promise<Service | Product> {
  const entityClass = ItemableEntityMap[itemableType];

  if (!entityClass) {
    throw new BadRequestException(`Unknown itemableType: ${itemableType}`);
  }

  const repo = dataSource.getRepository(entityClass);
  const itemable = await repo.findOneBy({
    id: itemableId,
    status: CommonStatus.ACTIVE,
  });

  if (!itemable) {
    throw new NotFoundException(`Itemable not found!`);
  }

  return itemable;
}
