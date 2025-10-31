import { z } from "zod";
import { USER_SEX, USER_STATUS } from "../constants/constants";
import { roleSchema } from "./role.schema";

export const baseUserSchema = z.object({
  fullName: z.string(),
  phoneNumber: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  sex: z.enum(USER_SEX),
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
  status: z.enum(USER_STATUS),
  userRoles: z.array(
    z.object({
      id: z.number(),
      role: roleSchema,
    })
  ),
});

export const changePwdFormSchema = z
  .object({
    oldPassword: z.string().min(8),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .superRefine((data, ctx) => {
    if (data.confirmPassword !== data.newPassword) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: z.ZodIssueCode.custom,
        message: "Password is not match!",
      });
    }
  });

export type UserType = z.infer<typeof userSchema>;
export type CreateUserFormType = z.infer<typeof createUserFormSchema>;
export type EditUserFormType = z.infer<typeof editUserFormSchema>;
export type changePwdFormType = z.infer<typeof changePwdFormSchema>;
