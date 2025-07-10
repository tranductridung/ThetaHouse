import { z } from "zod";
import {
  ConsignmentType,
  SourceStatus,
  PartnerTypeConst,
} from "../constants/constants";
import { createItemSchema, itemDraftSchema } from "./item";
import { discountSchema } from "./discount";

export const baseSourceSchema = z.object({
  note: z.string().optional(),
  totalAmount: z.number(),
  finalAmount: z.number(),
  creator: z.object({
    fullName: z.string(),
  }),
  status: z.enum(SourceStatus),
});

//Order
export const orderSchema = baseSourceSchema.extend({
  id: z.number(),
  discount: z.object({
    code: z.string(),
  }),
  customer: z.object({
    fullName: z.string(),
  }),
  quantity: z.number(),
});
export const orderDraftSchema = z.object({
  discountAmount: z.number(),
  subtotal: z.number(),
  quantity: z.number(),
  note: z.string().optional(),
  discount: discountSchema.optional(),
  customer: z.object({
    id: z.number(),
    fullName: z.string(),
    email: z.string(),
    phoneNumber: z.string(),
  }),
  items: z.array(itemDraftSchema),
});
export const createOrderSchema = z.object({
  note: z.string().optional(),
  discountId: z.number().optional(),
  customerId: z.number(),
  items: z.array(createItemSchema),
});

//Purchase
export const purchaseSchema = baseSourceSchema.extend({
  discountAmount: z.number().optional(),
  id: z.number(),
  supplier: z.object({
    fullName: z.string(),
  }),
  quantity: z.number(),
});
export const purchaseDraftSchema = z.object({
  discountAmount: z.number().optional(),
  subtotal: z.number(),
  quantity: z.number(),
  note: z.string().optional(),
  supplier: z.object({
    id: z.number(),
    fullName: z.string(),
    email: z.string(),
    phoneNumber: z.string(),
  }),
  // items: z.array(
  //   z.object({
  //     itemableType: z.enum(ItemableType),
  //     quantity: z.number(),
  //     name: z.string(),
  //     itemableId: z.number(),
  //     description: z.string(),
  //     unitPrice: z.number(),
  //     subtotal: z.number(),
  //   })
  // ),
  items: z.array(itemDraftSchema),
});
export const createPurchaseSchema = z.object({
  note: z.string().optional(),
  discountAmount: z.number().optional(),
  supplierId: z.number(),
  items: z.array(createItemSchema),
});

//Consignment
export const consignmentSchema = baseSourceSchema.extend({
  id: z.number(),
  commissionRate: z.number().gte(0).lte(100).optional(),
  partner: z.object({
    fullName: z.string(),
  }),
  customer: z.object({
    fullName: z.string(),
  }),
  type: z.enum(ConsignmentType),
});
export const createConsignmentSchema = z.object({
  type: z.enum(ConsignmentType),
  note: z.string().optional(),
  commissionRate: z.number().gte(0).lte(100).optional(),
  partnerId: z.number(),
  items: z.array(createItemSchema),
});

export const consignmentDraftSchema = z
  .object({
    type: z.enum(ConsignmentType),
    discountAmount: z.number(),
    commissionRate: z.number().gte(0).lte(100).optional(),
    subtotal: z.number(),
    quantity: z.number(),
    note: z.string().optional(),
    partner: z
      .object({
        id: z.number(),
        type: z.enum(PartnerTypeConst),
        fullName: z.string(),
        email: z.string(),
        phoneNumber: z.string(),
      })
      .optional(),
    items: z.array(
      itemDraftSchema.extend({
        defaultPurchasePrice: z.number(),
        defaultOrderPrice: z.number(),
      })
    ),
  })
  .superRefine((data, ctx) => {
    if (!data.partner) {
      ctx.addIssue({
        path: ["partner"],
        code: z.ZodIssueCode.custom,
        message: "Partner is required.",
      });
      return;
    }
  });
// Order
export type OrderType = z.infer<typeof orderSchema>;
export type CreateOrderType = z.infer<typeof createOrderSchema>;
export type OrderDraftType = z.infer<typeof orderDraftSchema>;
// Purchase
export type PurchaseType = z.infer<typeof purchaseSchema>;
export type CreatePurchaseType = z.infer<typeof createPurchaseSchema>;
export type PurchaseDraftType = z.infer<typeof purchaseDraftSchema>;
// Consignment
export type ConsignmentType = z.infer<typeof consignmentSchema>;
export type CreateConsignmentType = z.infer<typeof createConsignmentSchema>;
export type ConsignmentDraftType = z.infer<typeof consignmentDraftSchema>;
