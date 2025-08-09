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
import type { AppointmentType } from "../schemas/appointment.schema";
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
  {
    accessorFn: (row) => row.customer?.fullName ?? "",
    header: "Customer",
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
    accessorFn: (row) => row.healer?.fullName ?? "",
    header: "Healer",
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
    accessorFn: (row) => row.room?.name ?? "",
    header: "Room",
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
    accessorKey: "category",
    header: "Category",
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
