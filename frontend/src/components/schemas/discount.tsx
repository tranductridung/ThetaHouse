import { z } from "zod";
import { CommonStatus, DiscountType } from "../constants/constants";

export const baseDiscountSchema = z.object({
  name: z.string(),
  description: z.string(),
  code: z.string(),
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
