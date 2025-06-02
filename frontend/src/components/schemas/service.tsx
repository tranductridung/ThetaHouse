import { z } from "zod";

export const baseServiceSchema = z.object({
  name: z.string(),
  description: z.string(),
  duration: z.number().gt(0),
  session: z.number().gt(0),
  bonusSession: z.number().gt(0),
  unitPrice: z.number().gt(0),
});

export const createServiceFormSchema = baseServiceSchema.extend({
  type: z.string(),
});
export const editServiceFormSchema = baseServiceSchema.extend({});
export const serviceSchema = baseServiceSchema.extend({
  id: z.number(),
  type: z.string(),
  status: z.string(),
});

export type ServiceType = z.infer<typeof serviceSchema>;
export type CreateServiceFormType = z.infer<typeof createServiceFormSchema>;
export type EditServiceFormType = z.infer<typeof editServiceFormSchema>;
