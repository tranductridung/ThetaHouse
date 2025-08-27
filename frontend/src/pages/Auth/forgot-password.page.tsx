import ForgotPasswordForm, {
  type ForgotPasswordFormData,
} from "@/components/forms/forgot-password.form";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { handleAxiosError } from "@/lib/utils";
import axios from "axios";
import { useState } from "react";

export default function ForgotPassword() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [open, setOpen] = useState(false);
  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    try {
      await axios.post(`${backendUrl}/api/v1/auth/forgot-password`, {
        email: data.email,
      });
      setOpen(true);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Success</AlertDialogTitle>
            <AlertDialogDescription>
              The reset link has been sent to your email. It is valid for 5
              minutes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>OK</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <ForgotPasswordForm onSubmit={handleForgotPassword} />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src={undefined}
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
