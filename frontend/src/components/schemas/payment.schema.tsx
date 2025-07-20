import { z } from "zod";
import { PaymentMethod } from "../constants/constants";

export const basePaymentSchema = z.object({
  amount: z.number().gt(0),
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
  partner: z.object({
    fullName: z.string(),
  }),
});

export const createPaymentSchema = basePaymentSchema.extend({
  transactionId: z.number(),
  partnerId: z.number().optional(),
});

export const paymentDraftSchema = basePaymentSchema.extend({
  transactionId: z.number().nullable().optional(),
  // partner: z
  //     id: z.number(),
  //     type: z.enum(TypeOfPartner),
  //     fullName: z.string(),
  //     email: z.string(),
  //     phoneNumber: z.string(),
  //   })
  //   .optional(),
});

export type PaymentType = z.infer<typeof paymentSchema>;
export type CreatePaymentType = z.infer<typeof createPaymentSchema>;
export type PaymentDraftType = z.infer<typeof paymentDraftSchema>;
