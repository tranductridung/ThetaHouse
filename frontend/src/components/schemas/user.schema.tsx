import { z } from "zod";
import { SexType, UserRole, UserStatus } from "../constants/constants";

export const baseUserSchema = z.object({
  fullName: z.string(),
  phoneNumber: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  sex: z.enum(SexType).nullable().optional(),
  dob: z.date().nullable().optional(),
});

export const editUserFormSchema = baseUserSchema.extend({});
export const createUserFormSchema = baseUserSchema.extend({
  email: z.string().email(),
  password: z.string().min(8),
});

export const userSchema = baseUserSchema.extend({
  id: z.number(),
  email: z.string().email(),
  status: z.enum(UserStatus),
  role: z.enum(UserRole),
});

export type UserType = z.infer<typeof userSchema>;
export type CreateUserFormType = z.infer<typeof createUserFormSchema>;
export type EditUserFormType = z.infer<typeof editUserFormSchema>;
