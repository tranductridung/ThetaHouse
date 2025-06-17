import { z } from "zod";
import { InventoryAction } from "../constants/constants";

export const baseInventorySchema = z.object({
  action: z.enum(InventoryAction),
  quantity: z.number(),
  note: z.string().optional(),
});

export const inventorySchema = baseInventorySchema.extend({
  id: z.number(),
  itemId: z.number().optional(),
  product: z.object({
    name: z.string(),
    unit: z.string(),
    unitPrice: z.number(),
  }),
  creator: z.object({
    fullName: z.string(),
  }),
});
export const createInventorySchema = baseInventorySchema.extend({
  productId: z.number(),
});

export const inventoryDraftSchema = baseInventorySchema.extend({
  product: z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    unit: z.enum(["Piece", "Kg", "Box", "Liter", "Package"]),
    unitPrice: z.number(),
    quantity: z.number(),
  }),
});

export type InventoryType = z.infer<typeof inventorySchema>;
export type CreateInventoryType = z.infer<typeof createInventorySchema>;
export type InventoryDraftType = z.infer<typeof inventoryDraftSchema>;
