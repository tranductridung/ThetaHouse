"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import type { TransactionType } from "../schemas/transaction.schema";
import { getTransactionStatusIcon } from "../styles/TransactionStatus";

type ChooseTransactionProps = {
  handleChooseTransaction: (transaction: TransactionType) => void;
};

export const chooseTransactionColumns = ({
  handleChooseTransaction,
}: ChooseTransactionProps): ColumnDef<TransactionType>[] => [
  {
    id: "actions",
    cell: ({ row }) => {
      if (["Unpaid", "Partial"].includes(row.original.status))
        return (
          <Button
            onClick={() => {
              handleChooseTransaction(row.original);
            }}
          >
            Add
          </Button>
        );
      return;
    },
  },
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
];
