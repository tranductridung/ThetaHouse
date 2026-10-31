import { z } from "zod";
import { USER_SEX, USER_STATUS } from "../constants/constants";

export const addPayerSchema = z.object({
  payer: z.object({
    id: z.number(),
    email: z.string().email(),
    status: z.enum(USER_STATUS),
    fullName: z.string(),
    phoneNumber: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    sex: z.enum(USER_SEX),
    dob: z.date().nullable().optional(),
  }),
});

export type AddPayerType = z.infer<typeof addPayerSchema>;
