import { Consignment } from 'src/consignment/entities/consigment.entity';
import { Order } from 'src/order/entities/order.entity';
import { Purchase } from 'src/purchase/entities/purchase.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SourceType } from 'src/common/enums/enum';
import { DataSource, EntityManager } from 'typeorm';

export const SourceEntityMap = {
  [SourceType.CONSIGNMENT]: Consignment,
  [SourceType.ORDER]: Order,
  [SourceType.PURCHASE]: Purchase,
};

export async function loadSource(
  sourceId: number,
  sourceType: SourceType,
  managerOrDataSource: EntityManager | DataSource,
): Promise<Order | Purchase | Consignment> {
  const entityClass = SourceEntityMap[sourceType];

  if (!entityClass) {
    throw new BadRequestException(`Unknown sourceType: ${sourceType}`);
  }

  const repo = managerOrDataSource.getRepository(entityClass);
  const source = await repo.findOneBy({ id: sourceId });

  if (!source) {
    throw new NotFoundException(`Source not found!`);
  }
  return source;
}

// Sửa kiểu trả về: typeof Order | typeof Purchase | typeof Consignment
export function loadEntitySource(
  sourceType: SourceType,
): typeof Order | typeof Purchase | typeof Consignment {
  const entityClass = SourceEntityMap[sourceType];

  if (!entityClass) {
    throw new BadRequestException(`Unknown sourceType: ${sourceType}`);
  }

  return entityClass;
}
