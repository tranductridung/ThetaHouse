"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { getItemStatusIcon } from "../styles/ItemStatus";
import type { ItemType } from "../schemas/item.schema";
import type { SourceTypeConst } from "../constants/constants";

type ItemColumnsProps = {
  hasAction: boolean;
  onRemove?: (itemId: number, sourceId: number, sourceType: SourceTypeConst) => void;
  onTransfer?: (itemId: number) => void;
  onAddExportImport?: (itemId: number) => void;
  consignmentType?: "In" | "Out" | undefined;
  onCreateAppointment?: (id: number) => void;
  onChangeCourse?: (id: number) => void;
};

export const itemColumns = ({
  hasAction,
  onTransfer,
  onCreateAppointment,
  onRemove,
  onAddExportImport,
  consignmentType,
  onChangeCourse,
}: ItemColumnsProps): ColumnDef<ItemType>[] => {
  const getAction = (sourceType: SourceTypeConst) => {
    if (sourceType === "Order") return "Export";
    if (sourceType === "Purchase") return "Import";

    if (!consignmentType) return "Import/Export";
    return consignmentType === "In" ? "Import" : "Export";
  };
  return [
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
        (Number(row?.unitPrice) || 0).toLocaleString("vi-VN", {
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
        <div className="flex flex-row gap-2">
          <Badge
            className={`flex gap-1 px-1.5  [&_svg]:size-3  ${
              row.original.isActive
                ? "bg-blue-300 text-blue-700"
                : "bg-red-300 text-red-700"
            }`}
          >
            {row.original.isActive ? "Active" : "Inactive"}
          </Badge>
          <Badge
            variant="outline"
            className="flex gap-1 px-1.5 text-muted-foreground [&_svg]:size-3"
          >
            {getItemStatusIcon(row.original.status)}
            {row.original.status}
          </Badge>
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        if (!row.original.isActive || !hasAction)
          return <div className="h-8 w-8"></div>;

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
                onClick={() =>
                  onRemove(
                    row.original.id,
                    row.original.sourceId,
                    row.original.sourceType
                  )
                }
              >
                Remove
              </DropdownMenuItem>

              {row.original.itemableType === "Service" && (
                <>
                  <DropdownMenuItem onClick={() => onTransfer(row.original.id)}>
                    Transfer service
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onCreateAppointment(row.original.id)}
                  >
                    Create Appointment
                  </DropdownMenuItem>
                </>
              )}

              {row.original.itemableType === "Product" &&
                !["Imported", "Exported"].includes(row.original.status) && (
                  <DropdownMenuItem
                    onClick={() => onAddExportImport(row.original.id)}
                  >
                    {getAction(row.original.sourceType)}
                  </DropdownMenuItem>
                )}

              {row.original.itemableType === "Course" && (
                <>
                  <DropdownMenuItem
                    onClick={() => onChangeCourse(row.original.id)}
                  >
                    Change course
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
