import { z } from "zod";
import {
  CONSIGNMENT_TYPE,
  PARTNER_TYPE,
  SOURCE_STATUS,
} from "../constants/constants";
import { createItemSchema, itemDraftSchema } from "./item.schema";
import { discountSchema } from "./discount.schema";

const validateItemQuantiy = (data: any, ctx: z.RefinementCtx) => {
  if (data.itemableType === "Product") {
    if (data.availableQuantity == undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Product must have availableQuantity",
        path: ["quantity"],
      });
    } else if (data.quantity > data.availableQuantity) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_big,
        maximum: data.availableQuantity,
        type: "number",
        inclusive: true,
        path: ["quantity"],
        message: `Available quantity (${data.availableQuantity})`,
      });
    }
  }
};
export const baseSourceSchema = z.object({
  note: z.string().optional(),
  totalAmount: z.number(),
  finalAmount: z.number(),
  creator: z.object({
    fullName: z.string(),
  }),
  status: z.enum(SOURCE_STATUS),
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
  items: z.array(itemDraftSchema.superRefine(validateItemQuantiy)),
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
  }),
  payer: z.object({
    id: z.number(),
    fullName: z.string(),
  }),
  items: z.array(itemDraftSchema),
});
export const createPurchaseSchema = z.object({
  note: z.string().optional(),
  discountAmount: z.number().optional(),
  supplierId: z.number(),
  payerId: z.number(),
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
  payer: z
    .object({
      fullName: z.string(),
    })
    .nullable()
    .optional(),
  type: z.enum(CONSIGNMENT_TYPE),
});
export const createConsignmentSchema = z.object({
  type: z.enum(CONSIGNMENT_TYPE),
  note: z.string().optional(),
  commissionRate: z.number().gte(0).lte(100).optional(),
  partnerId: z.number(),
  payerId: z.number().nullable().optional(),
  items: z.array(createItemSchema),
});

export const consignmentDraftSchema = z
  .object({
    type: z.enum(CONSIGNMENT_TYPE),
    discountAmount: z.number(),
    commissionRate: z.number().gte(0).lte(100).optional(),
    subtotal: z.number(),
    quantity: z.number(),
    note: z.string().optional(),
    partner: z
      .object({
        id: z.number(),
        type: z.enum(PARTNER_TYPE),
        fullName: z.string(),
      })
      .nullable()
      .optional(),
    payer: z
      .object({
        id: z.number(),
        fullName: z.string(),
      })
      .nullable()
      .optional(),
    items: z.array(
      itemDraftSchema
        .extend({
          defaultPurchasePrice: z.number(),
          defaultOrderPrice: z.number(),
        })
        .superRefine(validateItemQuantiy)
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

    if (data.type === "In" && !data.payer) {
      ctx.addIssue({
        path: ["payer"],
        code: z.ZodIssueCode.custom,
        message: "Payer is required.",
      });
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
