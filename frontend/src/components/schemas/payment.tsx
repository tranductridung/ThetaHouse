import { z } from "zod";
import { PaymentMethod, TypeOfPartner } from "../constants/constants";

export const basePaymentSchema = z.object({
  amount: z.number().gte(0),
  method: z.enum(PaymentMethod),
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
  customer: z.object({
    fullName: z.string(),
  }),
});

export const createPaymentSchema = basePaymentSchema.extend({
  transactionId: z.number(),
  customerId: z.number(),
});

export const paymentDraftSchema = basePaymentSchema.extend({
  customer: z.object({
    id: z.number(),
    type: z.enum(TypeOfPartner),
    fullName: z.string(),
    email: z.string(),
    phoneNumber: z.string(),
  }),
});

export type PaymentType = z.infer<typeof paymentSchema>;
export type CreatePaymentType = z.infer<typeof createPaymentSchema>;
export type PaymentDraftType = z.infer<typeof paymentDraftSchema>;
