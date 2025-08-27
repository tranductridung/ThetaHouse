"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import * as z from "zod";
import PasswordField from "../PasswordField";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { handleAxiosError } from "@/lib/utils";

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: z.ZodIssueCode.custom,
        message: "Password not match!",
      });
    }
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPasswordForm = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    try {
      await axios.post(`${backendUrl}/api/v1/auth/reset-password`, {
        newPassword: data.newPassword,
        token,
      });
      toast.success("Reset password success!");
      navigate("/auth/login");
    } catch (error) {
      console.log("error in submit reset password", error);
      handleAxiosError(error);
      form.reset();
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">Reset your password</h1>
            <p>Enter your new password below</p>
          </div>

          {/* Password */}
          <PasswordField
            control={form.control}
            name="newPassword"
            label="New Password"
          ></PasswordField>

          {/* Password */}
          <PasswordField
            control={form.control}
            name="confirmPassword"
            label="Confirm Password"
          ></PasswordField>

          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Submitting..." : "Reset Password"}
          </Button>
        </form>
      </Form>
    </>
  );
};
export default ResetPasswordForm;
