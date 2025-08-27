"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ChevronsDown, ChevronsUp } from "lucide-react";
import type { InventoryType } from "../schemas/inventory.schema";
import { Badge } from "../ui/badge";

const actionStyle = {
  Import: <ChevronsUp className="text-green-500 dark:text-green-400" />,
  "Adjust-Plus": <ChevronsUp className="text-green-500 dark:text-green-400" />,

  Export: <ChevronsDown className="text-blue-500 dark:text-blue-400" />,
  "Adjust-Minus": <ChevronsDown className="text-blue-500 dark:text-blue-400" />,
};

export const inventoryColumns = (): ColumnDef<InventoryType>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorFn: (row) => row.product?.name ?? "",
    header: "Product Name",
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
    accessorFn: (row) => row.product?.unit ?? "",
    header: "Unit",
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorFn: (row) =>
      (row.unitPrice ?? 0).toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      }),
    header: "Unit Price",
  },
  {
    accessorKey: "action",
    header: "Action",

    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="flex gap-1 px-1.5 text-muted-foreground [&_svg]:size-3"
      >
        {actionStyle[row.original?.action as keyof typeof actionStyle] ?? null}
        {row.original?.action}
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
    cell: () => {
      return <div className="h-8 w-8"></div>;
    },
  },
];
