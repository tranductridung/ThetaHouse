import type { ItemStatusType } from "@/components/constants/constants";
import {
  CheckCircle2Icon,
  CircleX,
  LoaderIcon,
  CalendarCheck2,
  Repeat,
} from "lucide-react";

export const getItemStatusIcon = (status: ItemStatusType) => {
  switch (status) {
    case "None":
      return <CheckCircle2Icon className="text-blue-500 dark:text-blue-400" />;
    case "Imported":
    case "Exported":
      return <CircleX className="text-green-500 dark:text-green-400" />;
    case "Partial":
      return <CalendarCheck2 className="text-slate-500 dark:text-slate-400" />;
    case "Transfered":
      return <Repeat className="text-amber-500 dark:text-amber-400" />;
  }
};

export const getItemStatusStyle = (status?: ItemStatusType) => {
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
