import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import axios from "axios";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import PasswordField from "../PasswordField";
import { Input } from "@/components/ui/input";
import { handleAxiosError } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupType } from "../schemas/signup.schema";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "../dialog";

export const SignupForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const navigate = useNavigate();

  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const form = useForm<SignupType>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignupType) => {
    setIsLoading(true);
    const { confirmPassword, ...payload } = data;
    await axios
      .post(`${backendUrl}/api/v1/auth/signup`, { ...payload })
      .then((response) => {
        setShowEmailDialog(true);
      })
      .catch((error) => {
        handleAxiosError(error);
        form.reset();
      })
      .finally(() => setIsLoading(false));
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

          <Button
            disabled={isLoading}
            className="w-full bg-primary text-white"
            type="submit"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>Sign Up</>
            )}
          </Button>

          <div className="text-center text-sm">
            You have an account?{" "}
            <a href="/auth/login" className="hover:cursor-pointer text-primary">
              Login
            </a>
          </div>

          <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Verify your email</DialogTitle>
                <DialogDescription>
                  We've sent a verification link to your email.
                  <br />
                  Please check your inbox and click the link to verify your
                  account.
                </DialogDescription>
                <Button
                  className="bg-primary text-white"
                  onClick={() => {
                    setShowEmailDialog(false);
                    navigate("/auth/login");
                  }}
                >
                  Back to Login
                </Button>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </form>
      </Form>
    </>
  );
};
export default SignupForm;
