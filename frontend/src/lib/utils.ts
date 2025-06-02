import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function handleAxiosError(error: unknown) {
  if (axios.isAxiosError(error) && error.response) {
    toast.error(error.response.data?.error || "Error", {
      description: error.response.data?.message || "Unknown error",
    });
  } else {
    toast.error("Unexpected error", {
      description: "Something went wrong",
    });
  }
}
