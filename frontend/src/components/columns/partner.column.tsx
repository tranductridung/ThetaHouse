"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { Button } from "../ui/button";
import { MoreHorizontal } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { ActionItem } from "../commons/action-item.helper";
import type { PartnerType } from "../schemas/partner.schema";
import type { PartnerTypeConst } from "../constants/constants";

type PartnerProps = {
  onEdit: (partner: PartnerType) => void;
  onDetail: (partnerId: number, partnerType: PartnerTypeConst) => void;
};

export const partnerColumns = ({
  onEdit,
  onDetail,
}: PartnerProps): ColumnDef<PartnerType>[] => [
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
    accessorKey: "address",
    header: "Address",
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
            <ActionItem
              permission="partner:update"
              onClick={() => {
                onEdit(row.original);
              }}
            >
              Edit
            </ActionItem>

            <ActionItem
              permission="partner:read"
              onClick={() => {
                onDetail(row.original.id, row.original.type);
              }}
            >
              Detail
            </ActionItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
