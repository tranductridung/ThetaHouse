"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import type { PartnerType } from "../schemas/partner";

type ChoosePartnerProps = {
  handleChoosePartner: (partner: PartnerType) => void;
};

export const choosePartnerColumns = ({
  handleChoosePartner,
}: ChoosePartnerProps): ColumnDef<PartnerType>[] => [
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Button
          onClick={() => {
            handleChoosePartner(row.original);
          }}
        >
          Add
        </Button>
      );
    },
  },
  {
    accessorKey: "fullName",
    header: "Full Name",
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
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone Number",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
];
