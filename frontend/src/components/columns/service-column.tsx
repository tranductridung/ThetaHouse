"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import {
  CheckCircle2Icon,
  CircleX,
  LoaderIcon,
  MoreHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import type { ServiceType } from "../schemas/service";

type ServiceProps = {
  handleDelete: (id: number) => void;
  handleRestore: (id: number) => void;
  handleToggle: (id: number) => void;
  onEdit: (service: ServiceType) => void;
};

export const serviceColumns = ({
  handleDelete,
  handleRestore,
  handleToggle,
  onEdit,
}: ServiceProps): ColumnDef<ServiceType>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "duration",
    header: "Duration",
  },
  {
    accessorKey: "session",
    header: "Session",
  },
  {
    accessorKey: "bonusSession",
    header: "BonusSession",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorFn: (row) =>
      (row?.unitPrice ?? 0).toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      }),
    header: "Unit Price",
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
            <DropdownMenuItem
              onClick={() => {
                onEdit(row.original);
              }}
            >
              Edit
            </DropdownMenuItem>

            {row.original.status !== "Deleted" ? (
              <>
                <DropdownMenuItem
                  onClick={() => {
                    handleDelete(row.original.id);
                  }}
                >
                  Delete
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    handleToggle(row.original.id);
                  }}
                >
                  {row.original.status !== "Active" ? "Enable" : "Disable"}
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem
                onClick={() => {
                  handleRestore(row.original.id);
                }}
              >
                Restore
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
