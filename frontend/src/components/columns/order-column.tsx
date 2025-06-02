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
import type { OrderType } from "../schemas/source";

type OrderProps = {
  onDetail: (id: number) => void;
  onEdit: (order: OrderType) => void;
};

export const orderColumns = ({
  onDetail,
  onEdit,
}: OrderProps): ColumnDef<OrderType>[] => [
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
    header: "TotalAmount",
  },
  {
    accessorKey: "finalAmount",
    header: "FinalAmount",
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
    accessorFn: (row) => row.discount?.code ?? "",
    header: "Discount Code",
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
