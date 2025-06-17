"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import type { ServiceType } from "../schemas/service";

type AddServiceProps = {
  handleAddService: (service: ServiceType) => void;
};

export const addServiceColumns = ({
  handleAddService,
}: AddServiceProps): ColumnDef<ServiceType>[] => [
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Button
          onClick={() => {
            handleAddService(row.original);
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
    accessorKey: "duration",
    header: "Duration",
  },
  {
    accessorKey: "session",
    header: "Session",
  },
  {
    accessorKey: "bonusSession",
    header: "BonusSession",
  },
  {
    accessorKey: "type",
    header: "Type",
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
