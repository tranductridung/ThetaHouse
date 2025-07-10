import { z } from "zod";
import { SexType, PartnerTypeConst } from "../constants/constants";

export const basePartnerSchema = z.object({
  fullName: z.string(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  note: z.string().optional(),
  sex: z.enum(SexType).optional(),
  dob: z.date().optional(),
});

export const editPartnerFormSchema = basePartnerSchema.extend({});
export const createPartnerFormSchema = basePartnerSchema.extend({
  email: z.string().email(),
  type: z.enum(PartnerTypeConst),
});
export const partnerSchema = basePartnerSchema.extend({
  id: z.number(),
  email: z.string().email(),
  type: z.enum(PartnerTypeConst),
});

export type PartnerType = z.infer<typeof partnerSchema>;
export type CreatePartnerFormType = z.infer<typeof createPartnerFormSchema>;
export type EditPartnerFormType = z.infer<typeof editPartnerFormSchema>;
