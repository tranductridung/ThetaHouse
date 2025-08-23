import { ConsignmentType } from "./../../../backend/src/common/enums/enum";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";
import { toast } from "sonner";
import type { SourceTypeConst } from "@/components/constants/constants";

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

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    currencyDisplay: "code",
  })
    .format(value)
    .replace("VND", "")
    .trim();
};

export const getDefaultPrice = (
  sourceType: SourceTypeConst,
  consignmentType?: ConsignmentType
) => {
  if (sourceType === "Order") return "defaultOrderPrice";
  if (sourceType === "Purchase") return "defaultPurchasePrice";

  if (!consignmentType) {
    toast.error("Consignment Type is required!");
    return;
  }

  return consignmentType === "In"
    ? "defaultPurchasePrice"
    : "defaultOrderPrice";
};

export function omitFields<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const clone = { ...obj };
  keys.forEach((key) => {
    delete clone[key];
  });
  return clone;
}
