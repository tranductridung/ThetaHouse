import { CreateTransactionDto } from './create-transaction.dto';
import { OmitType } from '@nestjs/mapped-types';

export class CreateTransactionNoSourceDto extends OmitType(
  CreateTransactionDto,
  ['sourceId', 'sourceType'] as const,
) {}
