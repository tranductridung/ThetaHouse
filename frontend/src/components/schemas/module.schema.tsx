import { z } from "zod";
import { COMMON_STATUS, MODULE_TYPE } from "../constants/constants";

export const baseModuleSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});

export const createModuleFormSchema = baseModuleSchema.extend({
  type: z.enum(MODULE_TYPE),
});
export const editModuleFormSchema = baseModuleSchema.extend({});
export const moduleSchema = baseModuleSchema.extend({
  id: z.number(),
  type: z.enum(MODULE_TYPE),
  status: z.enum(COMMON_STATUS),
});

export type ModuleType = z.infer<typeof moduleSchema>;
export type CreateModuleFormType = z.infer<typeof createModuleFormSchema>;
export type EditModuleFormType = z.infer<typeof editModuleFormSchema>;
