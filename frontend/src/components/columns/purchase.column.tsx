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
import type { PurchaseType } from "../schemas/source.schema";
import { Badge } from "../ui/badge";
import { getSourceStatusIcon } from "../styles/SourceStatus";

type PurchaseProps = {
  onDetail: (id: number) => void;
  onImport: (id: number) => void;
  onCancel: (id: number) => void;
};

export const purchaseColumns = ({
  onDetail,
  onImport,
  onCancel,
}: PurchaseProps): ColumnDef<PurchaseType>[] => [
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
      (row?.discountAmount ?? 0).toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      }),
    header: "Discount Amount",
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
  },
  {
    accessorFn: (row) => row.supplier?.fullName ?? "",
    header: "Supplier",
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
                console.log(row.original);

                onDetail(row.original.id);
              }}
            >
              View Purchase
            </DropdownMenuItem>

            {row.original.status !== "Cancelled" && (
              <>
                <DropdownMenuItem
                  onClick={() => {
                    onImport(row.original.id);
                  }}
                >
                  Import Purchase
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    onCancel(row.original.id);
                  }}
                >
                  Cancel
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
