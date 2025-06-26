"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import type { ModuleType } from "../schemas/module";

type ChooseModuleProps = {
  handleChooseModule: (module: ModuleType) => void;
};

export const chooseModuleColumns = ({
  handleChooseModule,
}: ChooseModuleProps): ColumnDef<ModuleType>[] => [
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Button
          onClick={() => {
            handleChooseModule(row.original);
          }}
        >
          Add
        </Button>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "description",
    header: "Description",
  },

  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
];
