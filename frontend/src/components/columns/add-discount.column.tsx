"use client";

import type { DiscountType } from "../schemas/discount.schema";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";

type AddDiscountProps = {
  handleAddDiscount: (discount: DiscountType, itemId?: number) => void;
  itemId?: number;
};

export const addDiscountColumns = ({
  handleAddDiscount,
  itemId,
}: AddDiscountProps): ColumnDef<DiscountType>[] => [
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Button
          onClick={() => {
            handleAddDiscount(row.original, itemId);
          }}
        >
          Add
        </Button>
      );
    },
  },
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
    accessorKey: "code",
    header: "Code",
  },
  {
    accessorKey: "value",
    header: "Value",
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
];
