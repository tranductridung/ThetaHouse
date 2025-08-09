import { Transaction } from '../entities/transaction.entity';

export interface TransactionWithName extends Transaction {
  transaction_id: number;
  creatorFullName: string;
  payerFullName: string;
}
