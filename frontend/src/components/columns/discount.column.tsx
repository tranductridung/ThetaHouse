"use client";

import {
  CircleX,
  LoaderIcon,
  MoreHorizontal,
  CheckCircle2Icon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { ActionItem } from "../commons/action-item.helper";
import type { DiscountType } from "../schemas/discount.schema";

type DiscountProps = {
  handleDelete: (id: number) => void;
  handleRestore: (id: number) => void;
  handleToggle: (id: number) => void;
  onEdit: (discount: DiscountType) => void;
};

export const discountColumns = ({
  handleDelete,
  handleRestore,
  handleToggle,
  onEdit,
}: DiscountProps): ColumnDef<DiscountType>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ getValue }) => {
      const value = getValue() as string | undefined;
      if (!value) return null;

      const truncated = value.length > 20 ? value.slice(0, 20) + "..." : value;

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
    accessorKey: "code",
    header: "Code",
  },
  {
    accessorFn: (row) => {
      if (row.type === "Fixed") {
        return (row.value ?? 0).toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        });
      }

      // Default
      return `${row.value ?? 0}%`;
    },
    header: "Discount",
  },
  {
    accessorFn: (row) =>
      (row?.maxDiscountAmount ?? 0).toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      }),
    header: "Max Amount",
  },
  {
    accessorFn: (row) =>
      (row?.minTotalValue ?? 0).toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      }),

    header: "Min Total",
  },
  {
    accessorKey: "type",
    header: "Type",
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
              permission="discount:update"
              onClick={() => {
                onEdit(row.original);
              }}
            >
              Edit
            </ActionItem>

            {row.original.status !== "Deleted" ? (
              <>
                <ActionItem
                  permission="discount:delete"
                  onClick={() => {
                    handleDelete(row.original.id);
                  }}
                >
                  Delete
                </ActionItem>

                <ActionItem
                  permission="discount:update"
                  onClick={() => {
                    handleToggle(row.original.id);
                  }}
                >
                  {row.original.status !== "Active" ? "Enable" : "Disable"}
                </ActionItem>
              </>
            ) : (
              <ActionItem
                permission="discount:update"
                onClick={() => {
                  handleRestore(row.original.id);
                }}
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
