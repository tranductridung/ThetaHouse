"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle2Icon,
  CircleX,
  LoaderIcon,
  MoreHorizontal,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { ActionItem } from "../commons/action-item.helper";
import type { ProductType } from "../schemas/product.schema";
import { formatCurrency } from "@/lib/utils";

type ProductProps = {
  handleDelete: (id: number) => void;
  handleRestore: (id: number) => void;
  handleToggle: (id: number) => void;
  onEdit: (product: ProductType) => void;
};

export const productColumns = ({
  handleDelete,
  handleRestore,
  handleToggle,
  onEdit,
}: ProductProps): ColumnDef<ProductType>[] => [
  {
    accessorKey: "name",
    header: "Name",
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
    accessorKey: "description",
    header: "Description",
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
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorKey: "reserved",
    header: "Reserved",
  },
  {
    accessorKey: "unit",
    header: "Unit",
  },
  {
    accessorFn: (row) => {
      if (!row.useBaseQuantityPricing) return "-";
      return row.baseQuantityPerUnit;
    },
    header: "Base Qty",
  },
  {
    accessorFn: (row) => {
      if (!row.useBaseQuantityPricing) return "-";
      return formatCurrency(row?.orderPricePerBaseQuantity ?? 0);
    },
    header: "Order Base",
  },
  {
    accessorFn: (row) => {
      if (!row.useBaseQuantityPricing) return "-";

      return formatCurrency(row?.purchasePricePerBaseQuantity ?? 0);
    },
    header: "Purchase Base",
  },

  {
    accessorFn: (row) => formatCurrency(row?.defaultOrderPrice ?? 0),
    header: "Order Price",
  },
  {
    accessorFn: (row) => formatCurrency(row?.defaultPurchasePrice ?? 0),
    header: "Purchase Price",
  },

  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="flex gap-1 px-1.5 text-muted-foreground [&_svg]:size-3"
      >
        {row.original.status === "Active" ? (
          <CheckCircle2Icon className="text-green-500 dark:text-green-400" />
        ) : row.original.status === "Deleted" ? (
          <CircleX className="text-red-500 dark:text-red-400" />
        ) : (
          <LoaderIcon />
        )}
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
              permission="product:update"
              onClick={() => {
                onEdit(row.original);
              }}
            >
              Edit
            </ActionItem>

            {row.original.status !== "Deleted" ? (
              <>
                <ActionItem
                  permission="product:delete"
                  onClick={() => {
                    handleDelete(row.original.id);
                  }}
                >
                  Delete
                </ActionItem>

                <ActionItem
                  permission="product:update"
                  onClick={() => {
                    handleToggle(row.original.id);
                  }}
                >
                  {row.original.status !== "Active" ? "Enable" : "Disable"}
                </ActionItem>
              </>
            ) : (
              <ActionItem
                permission="product:update"
                onClick={() => {
                  handleRestore(row.original.id);
                }}
              >
                Restore
              </ActionItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
