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
import type { AppointmentType } from "../schemas/appointment";

type AppointmentProps = {
  onEdit: (product: AppointmentType) => void;
};

export const appointmentColumns = ({
  onEdit,
}: AppointmentProps): ColumnDef<AppointmentType>[] => [
  { accessorFn: (row) => row.item?.id ?? "", header: "ID" },
  { accessorFn: (row) => row.customer?.fullName ?? "", header: "Customer" },
  { accessorFn: (row) => row.healer?.fullName ?? "", header: "Healer" },
  { accessorFn: (row) => row.room?.name ?? "", header: "Room" },
  { accessorKey: "startAt", header: "StartAt" },
  { accessorKey: "endAt", header: "EndAt" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "type", header: "Type" },
  { accessorKey: "note", header: "Note" },
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
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
