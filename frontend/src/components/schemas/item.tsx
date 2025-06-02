import { z } from "zod";
import {
  CommonStatus,
  DiscountType,
  ItemableType,
  ItemSourceType,
  ItemStatus,
} from "../constants/constants";

export const baseDiscountSchema = z.object({
  sourceId: z.number().gte(0),
  sourceType: z.enum(ItemSourceType),
  itemableId: z.number().gte(0),
  itemableType: z.enum(ItemableType),
  quantity: z.number().gte(0),
  totalAmount: z.number().gte(0),
  discount: z.object({
    code: z.string(),
  }),
  finalAmount: z.number().gte(0),
  status: z.enum(ItemStatus),
  snapshot: z.object({
    unitPrice: z.number().gte(0),
    session: z.number().gte(0).optional(),
    bonusSession: z.number().gte(0).optional(),
    duration: z.number().gte(0).optional(),
  }),
});

export const discountSchema = baseDiscountSchema.extend({
  id: z.number(),
  value: z.number().gt(0).lte(100),
  type: z.enum(DiscountType),
  maxDiscountAmount: z.number().gte(0),
  status: z.enum(CommonStatus),
  minTotalValue: z.number().gte(0),
});
export const createDiscountFormSchema = baseDiscountSchema.extend({
  value: z.number().gt(0).lt(100),
  type: z.enum(DiscountType),
  maxDiscountAmount: z.number().gte(0).optional(),
  minTotalValue: z.number().gte(0).optional(),
});
export const editDiscountFormSchema = baseDiscountSchema.extend({});

export type DiscountType = z.infer<typeof discountSchema>;
export type CreateDiscountFormType = z.infer<typeof createDiscountFormSchema>;
export type EditDiscountFormType = z.infer<typeof editDiscountFormSchema>;
