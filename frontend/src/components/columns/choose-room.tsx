"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import type { RoomType } from "../schemas/room";

type ChooseRoomProps = {
  handleChooseRoom: (room: RoomType) => void;
};

export const chooseRoomColumns = ({
  handleChooseRoom,
}: ChooseRoomProps): ColumnDef<RoomType>[] => [
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Button
          onClick={() => {
            handleChooseRoom(row.original);
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
];
