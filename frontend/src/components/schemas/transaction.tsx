import { z } from "zod";
import {
  ItemSourceType,
  TypeOfTransaction,
  TransactionStatus,
} from "../constants/constants";
import { paymentSchema } from "./payment";

export const baseTransactionSchema = z.object({
  paidAmount: z.number().gte(0),
  note: z.string().optional(),
});

export const transactionSchema = baseTransactionSchema.extend({
  id: z.number(),
  type: z.enum(TypeOfTransaction),
  sourceId: z.number().gte(0),
  sourceType: z.enum(ItemSourceType),
  totalAmount: z.number().gte(0),
  status: z.enum(TransactionStatus),
  creator: z.object({
    fullName: z.string(),
  }),
  payments: z.array(paymentSchema),
});

export const createTransactionSchema = z.object({
  type: z.enum(TypeOfTransaction),
  totalAmount: z.number().gte(0),
  note: z.string(),
});
export const editTransactionFormSchema = baseTransactionSchema.extend({});

export type TransactionType = z.infer<typeof transactionSchema>;
export type CreateTransactionType = z.infer<typeof createTransactionSchema>;
export type EditTransactionFormType = z.infer<typeof editTransactionFormSchema>;
