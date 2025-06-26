import { z } from "zod";
import { ItemableType, ItemStatus } from "../constants/constants";
import { discountSchema } from "./discount";

export const baseItemSchema = z.object({
  itemableType: z.enum(ItemableType),
  quantity: z.number(),
});

export const itemSchema = baseItemSchema.extend({
  id: z.number(),
  sourceType: z.string(),
  sourceId: z.number(),
  totalAmount: z.number(),
  finalAmount: z.number(),
  status: z.enum(ItemStatus),
  snapshotData: z.object({
    unitPrice: z.string(),
    session: z.number(),
    bonusSession: z.number(),
  }),
  discount: z.object({
    code: z.string(),
  }),
  isActive: z.boolean(),
});

export const itemDraftSchema = baseItemSchema.extend({
  discount: discountSchema.optional(),
  itemableId: z.number(),
  name: z.string(),
  description: z.string(),
  unitPrice: z.number(),
  discountAmount: z.number(),
  subtotal: z.number(),
});

export const createItemSchema = baseItemSchema.extend({
  discountId: z.number().optional(),
  itemableId: z.number(),
});

export type ItemType = z.infer<typeof itemSchema>;
export type CreateItemType = z.infer<typeof createItemSchema>;
export type ItemDraftType = z.infer<typeof itemDraftSchema>;
