import api from "@/api/api";
import { roomColumns, type RoomType } from "@/components/columns/room-column";
import { DataTable } from "@/components/data-table";

import { useEffect, useState } from "react";

const Room = () => {
  const [data, setData] = useState<RoomType[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await api.get("/rooms");
      setData(response.data.rooms);
    };
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <DataTable columns={roomColumns} data={data} />
    </div>
  );
};

export default Room;
