import { z } from "zod";
import { COMMON_STATUS, DISCOUNT_TYPE } from "../constants/constants";

export const baseDiscountSchema = z.object({
  name: z.string(),
  description: z.string(),
  code: z.string(),
});

export const discountSchema = baseDiscountSchema.extend({
  id: z.number(),
  value: z.number().gte(0),
  type: z.enum(DISCOUNT_TYPE),
  maxDiscountAmount: z.number().gte(0),
  status: z.enum(COMMON_STATUS),
  minTotalValue: z.number().gte(0),
});

export const discountDraftSchema = baseDiscountSchema.extend({
  id: z.number(),
  value: z.number().gte(0),
  type: z.enum(DISCOUNT_TYPE),
  maxDiscountAmount: z.number().gte(0),
  minTotalValue: z.number().gte(0),
});

export const createDiscountFormSchema = baseDiscountSchema.extend({
  value: z.number().gte(0),
  type: z.enum(DISCOUNT_TYPE),
  maxDiscountAmount: z.number().gte(0).optional(),
  minTotalValue: z.number().gte(0).optional(),
});
export const editDiscountFormSchema = baseDiscountSchema.extend({});

export type DiscountType = z.infer<typeof discountSchema>;
export type CreateDiscountFormType = z.infer<typeof createDiscountFormSchema>;
export type EditDiscountFormType = z.infer<typeof editDiscountFormSchema>;
