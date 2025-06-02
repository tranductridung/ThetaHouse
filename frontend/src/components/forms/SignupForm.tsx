import { useForm } from "react-hook-form";
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
import PasswordField from "../PasswordField";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const signupSchema = z
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

type SignupFormData = z.infer<typeof signupSchema>;

const SignupForm = () => {
  const navigate = useNavigate();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    const { confirmPassword, ...payload } = data;
    await axios
      .post("http://localhost:3000/api/v1/auth/signup", { ...payload })
      .then((response) => {
        console.log(response);
        navigate("auth/login");
      })
      .catch((error) => {
        console.log(error);
        form.reset();
      });
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">Register new account</h1>
            <p className="text-balance text-sm text-muted-foreground">
              Enter your information below to register new account
            </p>
          </div>
          {/* Full Name */}
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

          {/* Password */}
          <PasswordField
            control={form.control}
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Confirm Password"
          ></PasswordField>

          <Button type="submit" className="w-full bg-primary text-white">
            Sign Up
          </Button>
          <div className="text-center text-sm">
            You have an account?{" "}
            <a href="/auth/login" className="hover:cursor-pointer text-primary">
              Login
            </a>
          </div>
        </form>
      </Form>
    </>
  );
};
export default SignupForm;
