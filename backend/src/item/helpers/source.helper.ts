import { Consignment } from 'src/consignment/entities/consigment.entity';
import { Order } from 'src/order/entities/order.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SourceType } from 'src/common/enums/enum';
import { DataSource, EntityManager } from 'typeorm';
import { Purchase } from 'src/purchase/entities/purchase.entity';

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
  let relation;

  if (sourceType === SourceType.ORDER) relation = 'customer';
  else if (sourceType === SourceType.PURCHASE) relation = 'supplier';
  else relation = 'partner';

  const source = await repo.findOne({
    where: {
      id: sourceId,
    },
    relations: [relation],
  });

  if (!source) {
    throw new NotFoundException(`Source not found!`);
  }
  return source;
}

export function loadEntitySource(
  sourceType: SourceType,
): typeof Order | typeof Purchase | typeof Consignment {
  const entityClass = SourceEntityMap[sourceType];

  if (!entityClass) {
    throw new BadRequestException(`Unknown sourceType: ${sourceType}`);
  }

  return entityClass;
}
