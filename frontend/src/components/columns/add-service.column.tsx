"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import type { ServiceType } from "../schemas/service.schema";
import { formatCurrency } from "@/lib/utils";

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
    accessorFn: (row) => formatCurrency(row?.unitPrice ?? 0),
    header: "Unit Price",
  },
];
