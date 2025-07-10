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
import { format } from "date-fns";
import { Badge } from "../ui/badge";
import { getAppointmentStatusIcon } from "../styles/SourceStatus";

type AppointmentProps = {
  onEdit: (product: AppointmentType) => void;
  handleSetComplete: (appointmentId: number) => void;
  onRemove: (appointmentId: number) => void;
};

export const appointmentColumns = ({
  onEdit,
  handleSetComplete,
  onRemove,
}: AppointmentProps): ColumnDef<AppointmentType>[] => [
  { accessorFn: (row) => row.item?.id ?? "", header: "ItemID" },
  { accessorFn: (row) => row.customer?.fullName ?? "", header: "Customer" },
  { accessorFn: (row) => row.healer?.fullName ?? "", header: "Healer" },
  { accessorFn: (row) => row.room?.name ?? "", header: "Room" },
  {
    accessorKey: "startAt",
    header: "Start Time",
    cell: ({ row }) => {
      const value = row.getValue("startAt");
      if (!value) return null;

      const date = new Date(value as string);
      return format(date, "HH:mm:ss dd/MM/yyyy");
    },
  },
  {
    accessorKey: "endAt",
    header: "End Time",
    cell: ({ row }) => {
      const value = row.getValue("endAt");
      if (!value) return null;

      const date = new Date(value as string);
      return format(date, "HH:mm:ss dd/MM/yyyy");
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="flex gap-1 px-1.5 text-muted-foreground [&_svg]:size-3"
      >
        {getAppointmentStatusIcon(row.original.status)}
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "note",
    header: "Note",
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

            {row.original.status !== "Completed" &&
              row.original.status !== "Cancelled" && (
                <DropdownMenuItem
                  onClick={() => {
                    handleSetComplete(row.original.id);
                  }}
                >
                  Mark as Completed
                </DropdownMenuItem>
              )}

            {row.original.status !== "Cancelled" && (
              <DropdownMenuItem
                onClick={() => {
                  onRemove(row.original.id);
                }}
              >
                Remove
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
