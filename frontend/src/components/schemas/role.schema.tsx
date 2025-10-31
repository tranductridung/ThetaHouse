import { z } from "zod";

export const baseRoleSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});

export const roleSchema = baseRoleSchema.extend({
  id: z.number(),
});

export const roleFormSchema = baseRoleSchema.extend({});

export type RoleType = z.infer<typeof roleSchema>;
export type RoleFormType = z.infer<typeof roleFormSchema>;
