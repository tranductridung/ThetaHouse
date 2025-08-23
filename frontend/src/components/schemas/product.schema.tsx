import { z } from "zod";
import { PRODUCT_UNIT } from "../constants/constants";

export const baseProductSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  unit: z.enum(PRODUCT_UNIT),

  defaultOrderPrice: z.number().optional().nullable(),
  defaultPurchasePrice: z.number().optional().nullable(),

  baseQuantityPerUnit: z.number().optional().nullable(),
  orderPricePerBaseQuantity: z.number().optional().nullable(),
  purchasePricePerBaseQuantity: z.number().optional().nullable(),
});

export const productSchema = baseProductSchema.extend({
  id: z.number(),
  reserved: z.number().gt(0),
  quantity: z.number().gt(0),
  status: z.string(),
  useBaseQuantityPricing: z.boolean(),
});

const validatePricingFields = (data: any, ctx: z.RefinementCtx) => {
  if (data.useBaseQuantityPricing) {
    const baseFields = [
      "baseQuantityPerUnit",
      "orderPricePerBaseQuantity",
      "purchasePricePerBaseQuantity",
    ] as const;

    for (const field of baseFields) {
      const value = data[field];
      if (typeof value !== "number" || value <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Required and must be > 0",
          path: [field],
        });
      }
    }
  } else {
    const defaultFields = [
      "defaultOrderPrice",
      "defaultPurchasePrice",
    ] as const;

    for (const field of defaultFields) {
      const value = data[field];
      if (typeof value !== "number" || value <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Required and must be > 0",
          path: [field],
        });
      }
    }
  }
};

export const createProductFormSchema = baseProductSchema
  .extend({
    useBaseQuantityPricing: z.boolean(),
  })
  .superRefine(validatePricingFields);

export const editProductFormSchema = baseProductSchema
  .extend({
    useBaseQuantityPricing: z.boolean(),
  })
  .superRefine(validatePricingFields);

export type ProductType = z.infer<typeof productSchema>;
export type CreateProductFormType = z.infer<typeof createProductFormSchema>;
export type EditProductFormType = z.infer<typeof editProductFormSchema>;
