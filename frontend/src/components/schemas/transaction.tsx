import { z } from "zod";
import {
  ItemSourceType,
  TypeOfTransaction,
  TransactionStatus,
} from "../constants/constants";

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
});
export const createTransactionFormSchema = baseTransactionSchema.extend({
  type: z.enum(TypeOfTransaction),
  sourceId: z.number().gte(0),
  sourceType: z.enum(ItemSourceType),
  totalAmount: z.number().gte(0),
  status: z.enum(TransactionStatus),
  creator: z.object({
    fullName: z.string(),
  }),
});
export const editTransactionFormSchema = baseTransactionSchema.extend({});

export type TransactionType = z.infer<typeof transactionSchema>;
export type CreateTransactionFormType = z.infer<
  typeof createTransactionFormSchema
>;
export type EditTransactionFormType = z.infer<typeof editTransactionFormSchema>;
