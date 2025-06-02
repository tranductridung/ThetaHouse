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

export const paymentSchema = z.object({
  amount: z.string(),
  method: z.string(),
  note: z.string(),
  transaction: z.object({
    id: z.number(),
  }),
  creator: z.object({
    fullName: z.string(),
  }),
  customer: z.object({
    fullName: z.string(),
  }),
});

export type PaymentType = z.infer<typeof paymentSchema>;

export const paymentColumns: ColumnDef<z.infer<typeof paymentSchema>>[] = [
  {
    accessorKey: "amount",
    header: "Amount",
  },
  {
    accessorKey: "method",
    header: "Method",
  },
  {
    accessorFn: (row) => row.transaction?.id ?? "",
    header: "Transantion",
  },
  {
    accessorFn: (row) => row.creator?.fullName ?? "",
    header: "Creator",
  },
  {
    accessorFn: (row) => row.customer?.fullName ?? "",
    header: "Customer",
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
