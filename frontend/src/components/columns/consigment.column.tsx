"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { MoreHorizontal } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { ActionItem } from "../commons/action-item.helper";
import { getSourceStatusIcon } from "../styles/SourceStatus";
import type { ConsignmentType } from "../schemas/source.schema";
import type { ConsignmentTypeConst } from "../constants/constants";

type ConsignmentProps = {
  onDetail: (id: number) => void;
  onHandle: (id: number) => void;
  onCancel: (id: number, type: ConsignmentTypeConst) => void;
};

export const consignmentColumns = ({
  onDetail,
  onHandle,
  onCancel,
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
    accessorFn: (row) => row.partner?.fullName ?? "",
    header: "Partner",
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
    accessorKey: "commissionRate",
    header: "Commission Rate",
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
            <ActionItem
              permission="consignment:read"
              onClick={() => {
                onDetail(row.original.id);
              }}
            >
              View Consignment
            </ActionItem>
            {row.original.status !== "Cancelled" && (
              <>
                <ActionItem
                  permission={`consignment:${
                    row.original.type === "In" ? "import" : "export"
                  }`}
                  onClick={() => {
                    onHandle(row.original.id);
                  }}
                >
                  {row.original.type === "In" ? "Import" : "Export"}
                </ActionItem>

                <ActionItem
                  permission="consignment:cancel"
                  onClick={() => {
                    onCancel(row.original.id, row.original.type);
                  }}
                >
                  Cancel
                </ActionItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
