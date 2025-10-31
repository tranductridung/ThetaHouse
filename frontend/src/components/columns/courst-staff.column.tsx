"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { Button } from "../ui/button";
import { MoreHorizontal } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { ActionItem } from "../commons/action-item.helper";
import type { CourseStaffType } from "../schemas/course.schema";

type CourseStaffProps = {
  handleDelete: (courseId: number, staffId: number) => void;
  onEdit: (courseStaff: CourseStaffType) => void;
};

export const courseStaffColumns = ({
  handleDelete,
  onEdit,
}: CourseStaffProps): ColumnDef<CourseStaffType>[] => [
  {
    accessorFn: (row) => row?.staff.fullName,
    header: "Staff Name",
    cell: ({ getValue }) => {
      const value = getValue() as string | undefined;
      if (!value) return null;

      const truncated = value.length > 25 ? value.slice(0, 25) + "..." : value;

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
    accessorFn: (row) => row?.course?.name,
    header: "Course Name",
    cell: ({ getValue }) => {
      const value = getValue() as string | undefined;
      if (!value) return null;

      const truncated = value.length > 25 ? value.slice(0, 25) + "..." : value;

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
    accessorFn: (row) => row?.course?.mode,
    header: "Mode",
  },
  {
    accessorFn: (row) => row?.course?.startDate,
    header: "Start Date",
    cell: ({ getValue }) => {
      const value = getValue();
      if (!value) return null;

      const date = new Date(value as string);
      return format(date, "HH:mm:ss dd/MM/yyyy");
    },
  },
  {
    accessorKey: "note",
    header: "Note",
    cell: ({ getValue }) => {
      const value = getValue() as string | undefined;
      if (!value) return null;

      const truncated = value.length > 25 ? value.slice(0, 25) + "..." : value;

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
    accessorKey: "role",
    header: "Role",
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
              permission="course-staff:update"
              onClick={() => {
                onEdit(row.original);
              }}
            >
              Edit
            </ActionItem>

            <>
              <ActionItem
                permission="course-staff:delete"
                onClick={() => {
                  handleDelete(row.original.course.id, row.original.staff.id);
                }}
              >
                Delete
              </ActionItem>
            </>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
