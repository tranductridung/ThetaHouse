import { z } from "zod";
import { PAYMENT_METHOD } from "../constants/constants";

export const basePaymentSchema = z.object({
  amount: z.number(),
  method: z.enum(PAYMENT_METHOD),
  note: z.string(),
});

export const paymentSchema = basePaymentSchema.extend({
  id: z.number(),
  transaction: z.object({
    id: z.number(),
  }),
  creator: z.object({
    fullName: z.string(),
  }),
  payer: z.object({
    fullName: z.string(),
  }),
});

export const createPaymentSchema = basePaymentSchema.extend({
  transactionId: z.number(),
});

export const paymentDraftSchema = basePaymentSchema.extend({});

export type PaymentType = z.infer<typeof paymentSchema>;
export type CreatePaymentType = z.infer<typeof createPaymentSchema>;
export type PaymentDraftType = z.infer<typeof paymentDraftSchema>;
