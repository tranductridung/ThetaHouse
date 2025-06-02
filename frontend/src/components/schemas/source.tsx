import { z } from "zod";
import { ConsignmentType } from "../constants/constants";

export const basesourceSchema = z.object({
  note: z.string().optional(),
  totalAmount: z.number(),
  finalAmount: z.number(),
  creator: z.object({
    fullName: z.string(),
  }),
});

//Order
export const orderSchema = basesourceSchema.extend({
  id: z.number(),
  discount: z.object({
    code: z.string(),
  }),
  customer: z.object({
    fullName: z.string(),
  }),
  quantity: z.number(),
});
export const createOrderFormSchema = basesourceSchema.extend({
  discount: z.object({
    code: z.string(),
  }),
  customer: z.object({
    fullName: z.string(),
  }),
  quantity: z.number(),
});
export const editOrderFormSchema = basesourceSchema.extend({}); // Not completed

//Purchase
export const purchaseSchema = basesourceSchema.extend({
  id: z.number(),
  supplier: z.object({
    fullName: z.string(),
  }),
  quantity: z.number(),
});
export const createPurchaseFormSchema = basesourceSchema.extend({});
export const editPurchaseFormSchema = basesourceSchema.extend({}); // Not completed

//Consignment
export const consignmentSchema = basesourceSchema.extend({
  id: z.number(),
  commissionRate: z.number(),
  partner: z.object({
    fullName: z.string(),
  }),
  customer: z.object({
    fullName: z.string(),
  }),
  type: z.enum(ConsignmentType),
});
export const createConsignmentFormSchema = basesourceSchema.extend({});
export const editConsignmentFormSchema = basesourceSchema.extend({}); // Not completed

// Order
export type OrderType = z.infer<typeof orderSchema>;
export type CreateOrderFormType = z.infer<typeof createOrderFormSchema>;
export type EditOrderFormType = z.infer<typeof editOrderFormSchema>;
// Purchase
export type PurchaseType = z.infer<typeof purchaseSchema>;
export type CreatePurchaseFormType = z.infer<typeof createPurchaseFormSchema>;
export type EditPurchaseFormType = z.infer<typeof editPurchaseFormSchema>;
// Consignment
export type ConsignmentType = z.infer<typeof consignmentSchema>;
export type CreateConsignmentFormType = z.infer<
  typeof createConsignmentFormSchema
>;
export type EditConsignmentFormType = z.infer<typeof editConsignmentFormSchema>;
