import { z } from "zod";

export const baseProductSchema = z.object({
  name: z.string(),
  description: z.string(),
  unit: z.enum(["Piece", "Kg", "Box", "Liter", "Package"]),
  unitPrice: z.number().gt(0),
});

export const productFormSchema = baseProductSchema.extend({});
export const productSchema = baseProductSchema.extend({
  id: z.number(),
  reserved: z.number().gt(0),
  quantity: z.number().gt(0),
  status: z.string(),
});

export type ProductType = z.infer<typeof productSchema>;
export type ProductFormType = z.infer<typeof productFormSchema>;
