"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import type { OrderType } from "../schemas/source.schema";
import { Badge } from "../ui/badge";
import { getSourceStatusIcon } from "../styles/SourceStatus";

type OrderProps = {
  onDetail: (id: number) => void;
  onCancel: (id: number) => void;
  handleExport: (id: number) => void;
};

export const orderColumns = ({
  onDetail,
  onCancel,
  handleExport,
}: OrderProps): ColumnDef<OrderType>[] => [
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorFn: (row) =>
      (row?.totalAmount ?? 0).toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      }),
    header: "Total Amount",
  },
  {
    accessorFn: (row) =>
      (row?.finalAmount ?? 0).toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      }),
    header: "Final Amount",
  },
  {
    accessorFn: (row) => row.creator?.fullName ?? "",
    header: "Creator",
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
    accessorFn: (row) => row.customer?.fullName ?? "",
    header: "Customer",
  },
  {
    accessorFn: (row) => row.discount?.code ?? "",
    header: "Discount Code",
  },
  {
    accessorKey: "note",
    header: "Note",
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
    accessorKey: "status",
    header: "Status",

    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="flex gap-1 px-1.5 text-muted-foreground [&_svg]:size-3"
      >
        {getSourceStatusIcon(row.original.status)}
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
                onDetail(row.original.id);
              }}
            >
              View Order
            </DropdownMenuItem>

            {row.original.status !== "Cancelled" ? (
              <>
                <DropdownMenuItem
                  onClick={() => {
                    onCancel(row.original.id);
                  }}
                >
                  Cancel
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    handleExport(row.original.id);
                  }}
                >
                  Export order
                </DropdownMenuItem>
              </>
            ) : (
              ""
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
