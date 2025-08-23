import type { ItemStatusConst } from "@/components/constants/constants";
import {
  CheckCircle2Icon,
  ClockIcon,
  MinusCircleIcon,
} from "lucide-react";

export const getItemStatusIcon = (status: ItemStatusConst) => {
  switch (status) {
    case "None":
      return <CheckCircle2Icon className="text-blue-500 dark:text-blue-400" />;
    case "Imported":
    case "Exported":
      return (
        <CheckCircle2Icon className="text-green-500 dark:text-green-400" />
      );
    case "Partial":
      return <ClockIcon className="text-slate-500 dark:text-slate-400" />;
    case "Transfered":
      return <MinusCircleIcon className="text-amber-500 dark:text-amber-400" />;
  }
};

export const getItemStatusStyle = (status?: ItemStatusConst) => {
  switch (status) {
    case "None":
      return "bg-blue-200 text-blue-600";
    case "Imported":
    case "Exported":
      return "bg-green-200 text-green-600";
    case "Partial":
      return "bg-blue-200 text-blue-600";
    case "Transfered":
      return "bg-amber-200 text-amber-600";
  }
};
