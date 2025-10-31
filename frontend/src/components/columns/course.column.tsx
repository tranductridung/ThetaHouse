"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle2Icon,
  CircleX,
  LoaderIcon,
  MoreHorizontal,
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import type { CourseType } from "../schemas/course.schema";
import { ActionItem } from "../commons/action-item.helper";

type CourseProps = {
  handleDelete: (id: number) => void;
  handleRestore: (id: number) => void;
  handleToggle: (id: number) => void;
  onEdit: (course: CourseType) => void;
  onDetail: (id: number) => void;
};

export const courseColumns = ({
  handleDelete,
  handleRestore,
  handleToggle,
  onEdit,
  onDetail,
}: CourseProps): ColumnDef<CourseType>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ getValue }) => {
      const value = getValue() as string | undefined;
      if (!value) return null;

      const truncated = value.length > 15 ? value.slice(0, 15) + "..." : value;

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
    accessorKey: "description",
    header: "Description",
    cell: ({ getValue }) => {
      const value = getValue() as string | undefined;
      if (!value) return null;

      const truncated = value.length > 15 ? value.slice(0, 15) + "..." : value;

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
    accessorKey: "meetingLinks",
    header: "Links",
    cell: ({ getValue }) => {
      const value = getValue() as string | undefined;
      if (!value) return null;

      const truncated = value.length > 15 ? value.slice(0, 15) + "..." : value;

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
    accessorKey: "meetingPassword",
    header: "Password",
    cell: ({ getValue }) => {
      const value = getValue() as string | undefined;
      if (!value) return null;

      const truncated = value.length > 15 ? value.slice(0, 15) + "..." : value;

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
    accessorKey: "offlineSession",
    header: "Offline Session",
  },
  {
    accessorKey: "onlineSession",
    header: "Online Session",
  },
  {
    accessorFn: (row) =>
      (row?.price ?? 0).toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      }),
    header: "Price",
  },
  {
    accessorKey: "mode",
    header: "Mode",
  },
  {
    accessorKey: "maxStudent",
    header: "Max Student",
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => {
      const value = row.getValue("startDate");
      if (!value) return null;

      const date = new Date(value as string);
      return format(date, "HH:mm:ss dd/MM/yyyy");
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
        {row.original.status === "Active" ? (
          <CheckCircle2Icon className="text-green-500 dark:text-green-400" />
        ) : row.original.status === "Deleted" ? (
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
              permission="course:update"
              onClick={() => onEdit(row.original)}
            >
              Edit
            </ActionItem>

            <DropdownMenuItem
              onClick={() => {
                onDetail(row.original.id);
              }}
            >
              Detail
            </DropdownMenuItem>

            {row.original.status !== "Deleted" ? (
              <>
                <ActionItem
                  permission="course:delete"
                  onClick={() => handleDelete(row.original.id)}
                >
                  Delete
                </ActionItem>

                <ActionItem
                  permission="course:update"
                  onClick={() => handleToggle(row.original.id)}
                >
                  {row.original.status !== "Active" ? "Enable" : "Disable"}
                </ActionItem>
              </>
            ) : (
              <ActionItem
                permission="course:update"
                onClick={() => handleRestore(row.original.id)}
              >
                Restore
              </ActionItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
