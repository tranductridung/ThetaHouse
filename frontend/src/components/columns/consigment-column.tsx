"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { MoreHorizontal } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ConsignmentType } from "../schemas/source";
import { getSourceStatusIcon } from "../styles/SourceStatus";

type ConsignmentProps = {
  onDetail: (id: number) => void;
  onHandle: (id: number) => void;
};

export const consignmentColumns = ({
  onDetail,
  onHandle,
}: ConsignmentProps): ColumnDef<ConsignmentType>[] => [
  { accessorKey: "id", header: "ID" },
  {
    accessorKey: "type",
    header: "Type",
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="flex gap-1 px-1.5 text-muted-foreground [&_svg]:size-3"
      >
        {getSourceStatusIcon(row.original.status)}
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
                onDetail(row.original.id);
              }}
            >
              View Consignment
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                onHandle(row.original.id);
              }}
            >
              {row.original.type === "In" ? "Import" : "Export"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
