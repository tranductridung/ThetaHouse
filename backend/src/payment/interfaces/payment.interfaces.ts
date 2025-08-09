import { Payment } from '../entities/payment.entity';

export interface PaymentWithName extends Payment {
  payment_id: number;
  transaction_id: number;
  creatorFullName: string;
  payerFullName: string;
}
