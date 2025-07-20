import api from "@/api/api";
import { useEffect, useState } from "react";
import { handleAxiosError } from "@/lib/utils";
import type { RoomType } from "./schemas/room.schema";
import { DataTable } from "@/components/data-table";
import { chooseRoomColumns } from "./columns/choose-room.column";

type ChooseroomProps = {
  handleChooseRoom: (room: RoomType) => void;
};

const ChooseRoom = ({ handleChooseRoom }: ChooseroomProps) => {
  const [data, setData] = useState<RoomType[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    try {
      const fetchData = async () => {
        const response = await api.get(
          `/rooms?page=${pageIndex}&limit=${pageSize}`
        );
        setData(response.data.rooms);
        setTotal(response.data.total);
      };
      fetchData();
    } catch (error) {
      handleAxiosError(error);
    }
  }, [pageIndex, pageSize]);

  return (
    <div>
      <DataTable
        onAdd={undefined}
        columns={chooseRoomColumns({
          handleChooseRoom,
        })}
        data={data}
        total={total}
        pageIndex={pageIndex}
        pageSize={pageSize}
        setPageIndex={setPageIndex}
        setPageSize={setPageSize}
      />
    </div>
  );
};
export default ChooseRoom;
