import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PayerType } from 'src/common/enums/enum';
import { DataSource, EntityManager } from 'typeorm';
import { Partner } from 'src/partner/entities/partner.entity';
import { User } from 'src/user/entities/user.entity';

export const payerEntityMap = {
  [PayerType.PARTNER]: Partner,
  [PayerType.USER]: User,
};

export async function loadPayer(
  payerId: number,
  payerType: PayerType,
  managerOrDataSource: EntityManager | DataSource,
): Promise<Partner | User> {
  const entityClass = payerEntityMap[payerType];

  if (!entityClass) {
    throw new BadRequestException(`Unknown payerType: ${payerType}`);
  }

  const repo = managerOrDataSource.getRepository(entityClass);

  const payer = await repo.findOne({
    where: {
      id: payerId,
    },
  });

  if (!payer) {
    throw new NotFoundException(`${payerType} not found!`);
  }
  return payer;
}
