import { z } from "zod";
import {
  SOURCE_TYPE,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from "../constants/constants";
import { paymentSchema } from "./payment.schema";

export const baseTransactionSchema = z.object({
  paidAmount: z.number().gte(0),
  note: z.string().optional(),
});

export const transactionSchema = baseTransactionSchema.extend({
  id: z.number(),
  type: z.enum(TRANSACTION_TYPE),
  sourceId: z.number().gte(0),
  sourceType: z.enum(SOURCE_TYPE),
  totalAmount: z.number().gte(0),
  status: z.enum(TRANSACTION_STATUS),
  creator: z.object({
    fullName: z.string(),
  }),
  payer: z.object({
    fullName: z.string(),
  }),
  payments: z.array(paymentSchema),
  customer: z.object({ id: z.number() }).nullable().optional(),
});
export const createTransactionSchema = z.object({
  type: z.enum(TRANSACTION_TYPE),
  totalAmount: z.number().gte(0),
  note: z.string(),
});
export const editTransactionFormSchema = baseTransactionSchema.extend({});

export type TransactionType = z.infer<typeof transactionSchema>;
export type CreateTransactionType = z.infer<typeof createTransactionSchema>;
export type EditTransactionFormType = z.infer<typeof editTransactionFormSchema>;
