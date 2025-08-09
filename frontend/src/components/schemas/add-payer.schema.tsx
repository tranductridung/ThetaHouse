import { z } from "zod";
import { userSchema } from "./user.schema";

export const addPayerSchema = z.object({
  payer: userSchema,
});

export type AddPayerType = z.infer<typeof addPayerSchema>;
