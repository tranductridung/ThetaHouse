import { z } from "zod";
import { UserRole, UserStatus } from "../constants/constants";

export const baseUserSchema = z.object({
  fullName: z.string(),
  phoneNumber: z.string(),
  address: z.string(),
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
