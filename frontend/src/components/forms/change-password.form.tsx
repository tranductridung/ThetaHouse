"use client";

import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import PasswordField from "../PasswordField";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  changePwdFormSchema,
  type changePwdFormType,
} from "../schemas/user.schema";

type ChangePasswordProps = {
  onSubmit: (formData: changePwdFormType) => void;
};

const ChangePasswordForm = ({ onSubmit }: ChangePasswordProps) => {
  const form = useForm<changePwdFormType>({
    resolver: zodResolver(changePwdFormSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Full Name */}
          <PasswordField
            control={form.control}
            name="oldPassword"
            label="Old Password"
          ></PasswordField>

          <PasswordField
            control={form.control}
            name="newPassword"
            label="New Password"
          ></PasswordField>

          <PasswordField
            control={form.control}
            name="confirmPassword"
            label="Confirm Password"
          ></PasswordField>

          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </Form>
    </>
  );
};
export default ChangePasswordForm;
