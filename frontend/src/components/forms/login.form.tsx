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
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { handleAxiosError } from "@/lib/utils";
const loginSchema = z.object({
  email: z.string().email({ message: "Email invalid!" }),
  password: z.string().min(8, { message: "Password at least 8 characters!" }),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const navigate = useNavigate();
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    await axios
      .post(
        "http://localhost:3000/api/v1/auth/login",
        { ...data },
        { withCredentials: true }
      )
      .then((response) => {
        console.log(response);
        const accessToken = response.data.accessToken;
        localStorage.setItem("accessToken", accessToken);

        navigate("/");
      })
      .catch((error) => {
        handleAxiosError(error);
        form.reset();
      });
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
