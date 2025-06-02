import { z } from "zod";
import { itemSchema } from "../columns/item-column";
import { discountSchema } from "./discount";
import { userSchema } from "./user";
import { partnerSchema } from "./partner";

export const basesourceDetailSchema = z.object({
  note: z.string().optional(),
  totalAmount: z.number(),
  finalAmount: z.number(),
  quantity: z.number(),
  creator: userSchema,
  customer: partnerSchema,
  discount: discountSchema.optional(),
  items: z.array(itemSchema),
});

//Order
export const orderSchema = basesourceDetailSchema.extend({
  id: z.number(),
});
export const createOrderFormSchema = basesourceDetailSchema.extend({});
export const editOrderFormSchema = basesourceDetailSchema.extend({}); // Not completed

//Purchase
export const purchaseSchema = basesourceDetailSchema.extend({
  id: z.number(),
});
export const createPurchaseFormSchema = basesourceDetailSchema.extend({});
export const editPurchaseFormSchema = basesourceDetailSchema.extend({}); // Not completed

//Consignment
export const consignmentSchema = basesourceDetailSchema.extend({
  id: z.number(),
});
export const createConsignmentFormSchema = basesourceDetailSchema.extend({});
export const editConsignmentFormSchema = basesourceDetailSchema.extend({}); // Not completed

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
