import type { SourceStatusType } from "@/components/constants/constants";
import {
  CheckCircle2Icon,
  CircleX,
  LoaderIcon,
  CalendarCheck2,
} from "lucide-react";

export const getSourceStatusIcon = (status: SourceStatusType) => {
  switch (status) {
    case "Completed":
      return (
        <CheckCircle2Icon className="text-green-500 dark:text-green-400" />
      );
    case "Cancelled":
      return <CircleX className="text-red-500 dark:text-red-400" />;
    case "Confirmed":
      return <CalendarCheck2 className="text-blue-500 dark:text-blue-400" />;
    case "Processing":
      return <LoaderIcon />;
  }
};

export const getSourceStatusStyle = (status?: SourceStatusType) => {
  switch (status) {
    case "Completed":
      return "bg-green-200 text-green-600";
    case "Cancelled":
      return "bg-red-200 text-red-600";
    case "Confirmed":
      return "bg-blue-200 text-blue-600";
    case "Processing":
      return "bg-slate-200 text-slate-600";
  }
};
