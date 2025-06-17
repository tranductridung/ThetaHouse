import type { TransactionStatusType } from "@/components/constants/constants";
import {
  CheckCircle2Icon,
  CircleX,
  AlertCircleIcon,
  ClockIcon,
} from "lucide-react";

export const getTransactionStatusIcon = (status: TransactionStatusType) => {
  switch (status) {
    case "Paid":
      return (
        <CheckCircle2Icon className="text-green-500 dark:text-green-400" />
      );
    case "Unpaid":
      return <CircleX className="text-red-500 dark:text-red-400" />;
    case "Overpaid":
      return <AlertCircleIcon className="text-amber-500 dark:text-amber-400" />;
    case "Partial":
      return <ClockIcon />;
  }
};

export const getTransactionStatusStyle = (status?: TransactionStatusType) => {
  switch (status) {
    case "Paid":
      return "bg-green-200 text-green-600";
    case "Unpaid":
      return "bg-red-200 text-red-600";
    case "Overpaid":
      return "bg-amber-200 text-amber-600";
    case "Partial":
      return "bg-slate-200 text-slate-600";
  }
};
