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
import { format } from "date-fns";
import type { TypeOfPartner } from "../constants/constants";
import type { PartnerType } from "../schemas/partner";

type PartnerProps = {
  onEdit: (partner: PartnerType) => void;
  onDetail: (partnerId: number, partnerType: TypeOfPartner) => void;
};

export const partnerColumns = ({
  onEdit,
  onDetail,
}: PartnerProps): ColumnDef<PartnerType>[] => [
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
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "note",
    header: "Note",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "sex",
    header: "Sex",
  },

  {
    accessorKey: "dob",
    header: "Dob",
    cell: ({ row }) => {
      const value = row.getValue("dob");
      if (!value) return null;

      const date = new Date(value as string);
      return format(date, "dd/MM/yyyy");
    },
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

            <DropdownMenuItem
              onClick={() => {
                onDetail(row.original.id, row.original.type);
              }}
            >
              Detail
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
