import { DataSource, EntityManager } from 'typeorm';
import { CommonStatus, ItemableType } from 'src/common/enums/enum';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Service } from 'src/service/entities/service.entity';
import { Product } from 'src/product/entities/product.entity';
import { Course } from 'src/course/entities/course.entity';

export const ItemableEntityMap = {
  [ItemableType.SERVICE]: Service,
  [ItemableType.PRODUCT]: Product,
  [ItemableType.COURSE]: Course,
};

export async function loadItemable(
  itemableId: number,
  itemableType: ItemableType,
  managerOrDataSource: DataSource | EntityManager,
): Promise<Service | Product | Course> {
  const entityClass = ItemableEntityMap[itemableType];

  if (!entityClass) {
    throw new BadRequestException(`Unknown itemableType: ${itemableType}`);
  }

  const repo = managerOrDataSource.getRepository(entityClass);

  const itemable = await repo.findOneBy({
    id: itemableId,
    status: CommonStatus.ACTIVE,
  });

  if (!itemable) {
    throw new NotFoundException(`${itemableType} not found!`);
  }

  return itemable;
}
