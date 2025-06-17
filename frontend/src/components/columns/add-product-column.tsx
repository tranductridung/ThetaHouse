"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import type { ProductType } from "../schemas/product";

type AddProductProps = {
  handleAddProduct: (product: ProductType) => void;
};

export const addProductColumns = ({
  handleAddProduct,
}: AddProductProps): ColumnDef<ProductType>[] => [
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Button
          onClick={() => {
            handleAddProduct(row.original);
          }}
        >
          Add
        </Button>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorFn: (row) =>
      (row?.unitPrice ?? 0).toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      }),

    header: "Unit Price",
  },
];
