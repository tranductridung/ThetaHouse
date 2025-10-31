"use client";

import type {
  SourceTypeConst,
  TransactionTypeConst,
} from "../constants/constants";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { MoreHorizontal } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { ActionItem } from "../commons/action-item.helper";
import type { TransactionType } from "../schemas/transaction.schema";
import { getTransactionStatusIcon } from "../styles/TransactionStatus";

type TransactionProps = {
  onAddPayment: (
    transactionId: number,
    transactionType: TransactionTypeConst,
    sourceType?: SourceTypeConst
  ) => void;
};

export const transactionColumns = ({
  onAddPayment,
}: TransactionProps): ColumnDef<TransactionType>[] => [
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
    accessorFn: (row) => row.payer?.fullName ?? "",
    header: "Payer",
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
    id: "actions",
    cell: ({ row }) => {
      if (["Unpaid", "Partial"].includes(row.original.status))
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
                permission="payment:create"
                onClick={() =>
                  onAddPayment(
                    row.original.id,
                    row.original.type,
                    row.original.sourceType
                  )
                }
              >
                Add Payment
              </ActionItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );

      return <div className="h-8 w-8" />;
    },
  },
];
