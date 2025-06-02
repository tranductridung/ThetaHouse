import { z } from "zod";
import { TypeOfPartner } from "../constants/constants";

export const basePartnerSchema = z.object({
  fullName: z.string(),
  phoneNumber: z.string(),
  address: z.string(),
  note: z.string().optional(),
});

export const editPartnerFormSchema = basePartnerSchema.extend({});
export const createPartnerFormSchema = basePartnerSchema.extend({
  email: z.string().email(),
  type: z.enum(TypeOfPartner),
});
export const partnerSchema = basePartnerSchema.extend({
  id: z.number(),
  email: z.string().email(),
  type: z.enum(TypeOfPartner),
});

export type PartnerType = z.infer<typeof partnerSchema>;
export type CreatePartnerFormType = z.infer<typeof createPartnerFormSchema>;
export type EditPartnerFormType = z.infer<typeof editPartnerFormSchema>;
