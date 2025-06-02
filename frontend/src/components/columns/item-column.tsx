"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { z } from "zod";
import { Button } from "../ui/button";

export const itemSchema = z.object({
  sourceType: z.string(),
  itemableType: z.string(),
  totalAmount: z.string(),
  quantity: z.number(),
  finalAmount: z.string(),
  status: z.string(),
  snapshotData: z.object({
    unitPrice: z.string(),
    session: z.number(),
    bonusSession: z.number(),
  }),
  discount: z.object({
    code: z.string(),
  }),
});

export type ItemType = z.infer<typeof itemSchema>;

export const itemColumns: ColumnDef<z.infer<typeof itemSchema>>[] = [
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
    accessorFn: (row) => row.snapshotData?.unitPrice ?? "",
    header: "Unit Price",
  },
  {
    accessorKey: "totalAmount",
    header: "Total Amount",
  },
  {
    accessorKey: "finalAmount",
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
