"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import {
  CheckCircle2Icon,
  CircleX,
  LoaderIcon,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { UserType } from "@/components/schemas/user";
import { UserRoleEnum } from "@/components/constants/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

type UserProps = {
  toggleStatus: (id: number) => void;
  handleChangeRole: (id: number, role: UserRoleEnum) => void;
};

export const userColumns = ({
  toggleStatus,
  handleChangeRole,
}: UserProps): ColumnDef<UserType>[] => [
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
    accessorKey: "status",
    header: "Status",

    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="flex gap-1 px-1.5 text-muted-foreground [&_svg]:size-3"
      >
        {row.original.status === "Active" ? (
          <CheckCircle2Icon className="text-green-500 dark:text-green-400" />
        ) : row.original.status === "Inactive" ? (
          <CircleX className="text-red-500 dark:text-red-400" />
        ) : (
          <LoaderIcon />
        )}
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const currentRole = row.original.role;
      const userId = row.original.id;

      return (
        <Select
          value={currentRole}
          onValueChange={(newRole) => {
            handleChangeRole(userId, newRole as UserRoleEnum);
          }}
        >
          <SelectTrigger className="h-8 w-40" id={`${userId}-role`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value={UserRoleEnum.ADMIN}>Admin</SelectItem>
            <SelectItem value={UserRoleEnum.MANAGER}>Manager</SelectItem>
            <SelectItem value={UserRoleEnum.EMPLOYEE}>Employee</SelectItem>
          </SelectContent>
        </Select>
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
                toggleStatus(row.original.id);
              }}
            >
              {row.original.status !== "Active" ? "Enable" : "Disable"}
            </DropdownMenuItem>

            {/* <DropdownMenuItem
              onClick={() => {
                toggleStatus(row.original.id);
              }}
            >
              {row.original.status !== "Active" ? "Enable" : "Disable"}
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
