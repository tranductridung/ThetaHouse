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
