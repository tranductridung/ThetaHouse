import { z } from "zod";
import { discountSchema } from "./discount.schema";
import { userSchema } from "./user.schema";
import { partnerSchema } from "./partner.schema";
import { ConsignmentType, SourceStatus } from "../constants/constants";
import { itemSchema } from "./item.schema";

export const baseSourceDetailSchema = z.object({
  note: z.string().optional(),
  totalAmount: z.number(),
  finalAmount: z.number(),
  quantity: z.number(),
  creator: userSchema,
  items: z.array(itemSchema),
});

//Order
export const orderSchema = baseSourceDetailSchema.extend({
  id: z.number(),
  status: z.enum(SourceStatus),
  customer: partnerSchema,
  discount: discountSchema,
});
export const createOrderFormSchema = baseSourceDetailSchema.extend({
  customer: partnerSchema,
});
export const editOrderFormSchema = baseSourceDetailSchema.extend({}); // Not completed

//Purchase
export const purchaseSchema = baseSourceDetailSchema.extend({
  supplier: partnerSchema,
  discountAmount: z.number().optional(),
  status: z.enum(SourceStatus),
  id: z.number(),
});
export const createPurchaseFormSchema = baseSourceDetailSchema.extend({
  supplier: partnerSchema,
});
export const editPurchaseFormSchema = baseSourceDetailSchema.extend({}); // Not completed

//Consignment
export const consignmentSchema = baseSourceDetailSchema.extend({
  id: z.number(),
  status: z.enum(SourceStatus),
  type: z.enum(ConsignmentType),
  commissionRate: z.number().lte(100).gte(0),
  partner: partnerSchema,
});
export const createConsignmentFormSchema = baseSourceDetailSchema.extend({
  partner: partnerSchema,
});
export const editConsignmentFormSchema = baseSourceDetailSchema.extend({}); // Not completed

// Order
export type OrderDetailType = z.infer<typeof orderSchema>;
export type CreateOrderDetailFormType = z.infer<typeof createOrderFormSchema>;
export type EditOrderDetailFormType = z.infer<typeof editOrderFormSchema>;
// Purchase
export type PurchaseDetailType = z.infer<typeof purchaseSchema>;
export type CreatePurchaseDetailFormType = z.infer<
  typeof createPurchaseFormSchema
>;
export type EditPurchaseDetailFormType = z.infer<typeof editPurchaseFormSchema>;
// Consignment
export type ConsignmentDetailType = z.infer<typeof consignmentSchema>;
export type CreateConsignmentDetailFormType = z.infer<
  typeof createConsignmentFormSchema
>;
export type EditConsignmentDetailFormType = z.infer<
  typeof editConsignmentFormSchema
>;
