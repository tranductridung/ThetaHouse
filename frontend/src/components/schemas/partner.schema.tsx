import { z } from "zod";
import { USER_SEX, PARTNER_TYPE } from "../constants/constants";

export const basePartnerSchema = z.object({
  fullName: z.string(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  note: z.string().optional(),
  sex: z.enum(USER_SEX).optional(),
  dob: z.date().optional(),
});

export const editPartnerFormSchema = basePartnerSchema.extend({});
export const createPartnerFormSchema = basePartnerSchema.extend({
  email: z.string().email(),
  type: z.enum(PARTNER_TYPE),
});
export const partnerSchema = basePartnerSchema.extend({
  id: z.number(),
  email: z.string().email(),
  type: z.enum(PARTNER_TYPE),
});

export type PartnerType = z.infer<typeof partnerSchema>;
export type CreatePartnerFormType = z.infer<typeof createPartnerFormSchema>;
export type EditPartnerFormType = z.infer<typeof editPartnerFormSchema>;
