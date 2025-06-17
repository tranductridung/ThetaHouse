"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import type { UserType } from "../schemas/user";

type ChooseUserProps = {
  handleChooseUser: (user: UserType) => void;
};

export const chooseUserColumns = ({
  handleChooseUser,
}: ChooseUserProps): ColumnDef<UserType>[] => [
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Button
          onClick={() => {
            handleChooseUser(row.original);
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
