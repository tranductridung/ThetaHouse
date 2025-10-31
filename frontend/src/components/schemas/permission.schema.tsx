import { z } from "zod";

export const basePermissionSchema = z.object({
  action: z.string(),
  resource: z.string(),
  description: z.string().optional(),
});

export const permissionSchema = basePermissionSchema.extend({
  id: z.number(),
});

export const permissionFormSchema = basePermissionSchema.extend({});

export type PermissionType = z.infer<typeof permissionSchema>;
export type PermissionFormType = z.infer<typeof permissionFormSchema>;
