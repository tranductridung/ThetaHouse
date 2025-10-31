"use client";

import {
  CheckCircle2Icon,
  CircleX,
  LoaderIcon,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { ActionItem } from "../commons/action-item.helper";
import type { EnrollmentType } from "../schemas/enrollment.schema";

type EnrollmentProps = {
  handleDelete: (id: number) => void;
  onEdit: (enrollment: EnrollmentType) => void;
};

export const enrollmentColumns = ({
  handleDelete,
  onEdit,
}: EnrollmentProps): ColumnDef<EnrollmentType>[] => [
  {
    accessorFn: (row) => row?.student?.fullName,
    header: "Student Name",
    cell: ({ getValue }) => {
      const value = getValue() as string | undefined;
      if (!value) return null;

      const truncated = value.length > 25 ? value.slice(0, 25) + "..." : value;

      return (
        <div>
          <h1 title={value} className="cursor-help">
            {truncated}
          </h1>
        </div>
      );
    },
  },
  {
    accessorFn: (row) => row?.course?.name,
    header: "Course Name",
    cell: ({ getValue }) => {
      const value = getValue() as string | undefined;
      if (!value) return null;

      const truncated = value.length > 25 ? value.slice(0, 25) + "..." : value;

      return (
        <div>
          <h1 title={value} className="cursor-help">
            {truncated}
          </h1>
        </div>
      );
    },
  },
  {
    accessorFn: (row) => row?.course?.mode,
    header: "Mode",
  },
  {
    accessorFn: (row) => row?.course?.startDate,
    header: "Start Date",
    cell: ({ getValue }) => {
      const value = getValue();
      if (!value) return null;

      const date = new Date(value as string);
      return format(date, "HH:mm:ss dd/MM/yyyy");
    },
  },
  {
    accessorKey: "note",
    header: "Note",
    cell: ({ getValue }) => {
      const value = getValue() as string | undefined;
      if (!value) return null;

      const truncated = value.length > 25 ? value.slice(0, 25) + "..." : value;

      return (
        <div>
          <h1 title={value} className="cursor-help">
            {truncated}
          </h1>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="flex gap-1 px-1.5 text-muted-foreground [&_svg]:size-3"
      >
        {row.original.status === "Enrolled" ? (
          <CheckCircle2Icon className="text-green-500 dark:text-green-400" />
        ) : row.original.status === "Withdrawn" ? (
          <CircleX className="text-red-500 dark:text-red-400" />
        ) : (
          <LoaderIcon />
        )}
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      if (row.original.status === "Withdrawn")
        return <div className="h-8 w-8"></div>;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <ActionItem
              permission="enrollment:update"
              onClick={() => {
                onEdit(row.original);
              }}
            >
              Edit
            </ActionItem>

            <ActionItem
              permission="enrollment:update"
              onClick={() => {
                handleDelete(row.original.id);
              }}
            >
              Withdrawn
            </ActionItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
