import { z } from "zod";

export const addPartnerSchema = z.object({
  // partner: partnerSchema,
  partner: z.object({ id: z.number(), fullName: z.string() }),
});

export type AddPartnerType = z.infer<typeof addPartnerSchema>;
