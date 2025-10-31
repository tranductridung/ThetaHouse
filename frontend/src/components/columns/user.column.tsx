"use client";

import {
  CheckCircle2Icon,
  CircleX,
  LoaderIcon,
  MoreHorizontal,
} from "lucide-react";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectContent,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import type { RoleType } from "../schemas/role.schema";
import type { UserAuthContextType } from "@/auth/AuthContext";
import type { UserType } from "@/components/schemas/user.schema";

type UserProps = {
  toggleStatus: (id: number) => void;
  handleChangeRole: (userId: number, roleId: number) => void;
  roleList: RoleType[];
  user: UserAuthContextType | null;
};

export const userColumns = ({
  toggleStatus,
  handleChangeRole,
  roleList,
  user,
}: UserProps): ColumnDef<UserType>[] => [
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
      const currentRole = row.original.userRoles[0].role;
      const userId = row.original.id;

      if (user?.permissions.includes("authorization:create"))
        return (
          <Select
            value={currentRole.name}
            disabled={user?.email === row.original.email}
            onValueChange={(newRoleName) => {
              let newRoleId;
              roleList.forEach((role) => {
                if (role.name === newRoleName) newRoleId = role.id;
              });

              handleChangeRole(userId, Number(newRoleId));
            }}
          >
            <SelectTrigger className="h-8 w-40" id={`${userId}-role`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {roleList.map((r) => {
                console.log(r);
                return (
                  <>
                    <SelectItem value={r.name}>
                      {r.name[0].toUpperCase() + r.name.slice(1).toLowerCase()}
                    </SelectItem>
                  </>
                );
              })}
            </SelectContent>
          </Select>
        );

      return <div>{currentRole.name}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      if (user?.email === row.original.email) return null;

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
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
