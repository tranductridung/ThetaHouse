"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { PaymentType } from "../schemas/payment.schema";

export const paymentColumns: ColumnDef<PaymentType>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorFn: (row) =>
      (row?.amount ?? 0).toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      }),
    header: "Amount",
  },
  {
    accessorKey: "method",
    header: "Method",
  },
  {
    accessorFn: (row) => row.transaction?.id ?? "",
    header: "Transaction",
  },
  {
    accessorFn: (row) => row.creator?.fullName ?? "",
    header: "Creator",
  },
  {
    accessorFn: (row) => row.payer?.fullName ?? "",
    header: "Payer",
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
];
