import z from "zod";

export const signupSchema = z
  .object({
    fullName: z.string(),
    email: z.string().email({ message: "Email invalid!" }),
    password: z.string().min(8, { message: "Password at least 8 characters!" }),
    confirmPassword: z
      .string()
      .min(8, { message: "Password at least 8 characters!" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password is not match!",
    path: ["confirmPassword"],
  });

export type SignupType = z.infer<typeof signupSchema>;
