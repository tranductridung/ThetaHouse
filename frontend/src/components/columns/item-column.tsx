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
import { Badge } from "../ui/badge";
import { getItemStatusIcon } from "../styles/ItemStatus";
import type { ItemType } from "../schemas/item";

export const itemColumns: ColumnDef<ItemType>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "sourceType",
    header: "Source",
  },
  {
    accessorKey: "itemableType",
    header: "Itemable",
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorFn: (row) =>
      (Number(row.snapshotData?.unitPrice) || 0).toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      }),
    header: "Unit Price",
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
    accessorFn: (row) => row.snapshotData?.session ?? "",
    header: "Session",
  },
  {
    accessorFn: (row) => row.snapshotData?.bonusSession ?? "",
    header: "Bonus Session",
  },
  {
    accessorFn: (row) => row.discount?.code ?? "",
    header: "Discount Code",
  },
  {
    accessorKey: "status",
    header: "Status",

    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="flex gap-1 px-1.5 text-muted-foreground [&_svg]:size-3"
      >
        {getItemStatusIcon(row.original.status)}
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
