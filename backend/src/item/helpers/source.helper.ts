import { Consigment } from 'src/consigment/entities/consigment.entity';
import { Order } from 'src/order/entities/order.entity';
import { Purchase } from 'src/purchase/entities/purchase.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SourceType } from 'src/common/enums/enum';
import { DataSource, EntityManager } from 'typeorm';

export const SourceEntityMap = {
  [SourceType.CONSIGMENT]: Consigment,
  [SourceType.ORDER]: Order,
  [SourceType.PURCHASE]: Purchase,
};

export async function loadSource(
  sourceId: number,
  sourceType: SourceType,
  managerOrDataSource: EntityManager | DataSource,
): Promise<Order | Purchase | Consigment> {
  const entityClass = SourceEntityMap[sourceType];

  if (!entityClass) {
    throw new BadRequestException(`Unknown sourceType: ${sourceType}`);
  }

  const repo = managerOrDataSource.getRepository(entityClass); // dùng chung cho EntityManager/DataSource
  const source = await repo.findOneBy({ id: sourceId });

  if (!source) {
    throw new NotFoundException(`Source not found!`);
  }
  return source;
}
