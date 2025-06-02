"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { z } from "zod";
import { Button } from "../ui/button";

export const appointmentSchema = z.object({
  note: z.string(),
  startAt: z.string(),
  endAt: z.string(),
  status: z.string(),
  type: z.string(),

  item: z.object({
    id: z.string(),
  }),
  healer: z.object({
    fullName: z.string(),
  }),
  room: z.object({
    name: z.string(),
  }),
  customer: z.object({
    fullName: z.string(),
  }),
});

export type AppointmentType = z.infer<typeof appointmentSchema>;

export const appointmentColumns: ColumnDef<
  z.infer<typeof appointmentSchema>
>[] = [
  { accessorFn: (row) => row.item?.id ?? "", header: "Item ID" },
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
                console.log(row.original);
              }}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
