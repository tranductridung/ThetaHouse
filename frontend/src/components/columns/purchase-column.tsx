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
import type { PurchaseType } from "../schemas/source";

type PurchaseProps = {
  onDetail: (id: number) => void;
  onEdit: (order: PurchaseType) => void;
};

export const purchaseColumns = ({
  onDetail,
  onEdit,
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
    accessorKey: "totalAmount",
    header: "Total Amount",
  },
  {
    accessorKey: "discountAmount",
    header: "Discount Amount",
  },
  {
    accessorKey: "finalAmount",
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
                onEdit(row.original);
              }}
            >
              Edit
            </DropdownMenuItem>
            {/* <DropdownMenuItem>Delete</DropdownMenuItem> */}

            <DropdownMenuItem
              onClick={() => {
                console.log(row.original);

                onDetail(row.original.id);
              }}
            >
              More
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
