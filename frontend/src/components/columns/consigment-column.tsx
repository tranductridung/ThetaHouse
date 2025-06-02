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
import type { ConsignmentType } from "../schemas/source";

type ConsignmentProps = {
  onEdit: (consignment: ConsignmentType) => void;
  onDetail: (id: number) => void;
};

// export const orderColumns = ({
//   onDetail,
//   onEdit,
// }: OrderProps): ColumnDef<OrderType>[] => [

export const consignmentColumns = ({
  onEdit,
  onDetail,
}: ConsignmentProps): ColumnDef<ConsignmentType>[] => [
  { accessorKey: "id", header: "Id" },
  {
    accessorKey: "type",
    header: "Type",
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
    accessorFn: (row) => row.creator?.fullName ?? "",
    header: "Creator",
  },
  {
    accessorFn: (row) => row.partner?.fullName ?? "",
    header: "Partner",
  },
  {
    accessorKey: "commissionRate",
    header: "Commission Rate",
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
