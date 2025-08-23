"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import * as z from "zod";
import PasswordField from "../PasswordField";
import { useAuth } from "@/auth/useAuth";
const loginSchema = z.object({
  email: z.string().email({ message: "Email invalid!" }),
  password: z.string(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const { login } = useAuth();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
    } catch (error) {
      form.reset();
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">Login to your account</h1>
            <p className="text-balance text-sm text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <PasswordField control={form.control} name="password"></PasswordField>

          <Button type="submit" className="w-full">
            Login
          </Button>

          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <a
              href="/auth/signup"
              className="hover:cursor-pointer text-primary"
            >
              Sign up
            </a>
          </div>
        </form>
      </Form>
    </>
  );
};
export default LoginForm;
