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
import type { TransactionType } from "../schemas/transaction";
import { Badge } from "../ui/badge";
import { getTransactionStatusIcon } from "../styles/TransactionStatus";

export const transactionColumns: ColumnDef<TransactionType>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "sourceType",
    header: "Source Type",
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
      (row?.paidAmount ?? 0).toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      }),
    header: "Paid Amount",
  },
  {
    accessorKey: "status",
    header: "Status",

    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="flex gap-1 px-1.5 text-muted-foreground [&_svg]:size-3"
      >
        {getTransactionStatusIcon(row.original.status)}
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorFn: (row) => row.creator?.fullName ?? "",
    header: "Creator",
  },
  {
    accessorKey: "note",
    header: "Note",
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
              }}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
