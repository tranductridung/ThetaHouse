import api from "@/api/api";
import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import type { RoomFormType, RoomType } from "@/components/schemas/room.schema";
import { roomColumns } from "@/components/columns/room.column";
import { handleAxiosError } from "@/lib/utils";
import PageTitle from "@/components/Title";
import { toast } from "sonner";
import { useCombineFormManager } from "@/hooks/use-custom-manager";
import RoomModal from "@/components/modals/room.modal";

type RoomProps = {
  isUseTitle?: boolean;
};

const RoomTest = ({ isUseTitle = true }: RoomProps) => {
  const [data, setData] = useState<RoomType[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const { formManager, setFormManager, onAdd, onEdit, onClose } =
    useCombineFormManager<RoomType>();

  const fetchData = async () => {
    try {
      const response = await api.get(
        `/rooms?page=${pageIndex}&limit=${pageSize}`
      );
      setData(response.data.rooms);
      setTotal(response.data.total);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleSubmit = async (formData: RoomFormType) => {
    try {
      if (formManager.type === "add") {
        await api.post("/rooms", formData);
        toast.success("Add room success!");
      } else if (formManager.type === "edit" && formManager.data?.id) {
        await api.patch(`/rooms/${formManager.data.id}`, formData);
        toast.success("Edit room success!");
      }

      fetchData();
      setFormManager({
        isShow: false,
        type: "add",
        data: null,
      });
    } catch (error) {
      handleAxiosError(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize]);

  return (
    <div className="p-4">
      {isUseTitle && <PageTitle title="Room"></PageTitle>}

      <DataTable
        onAdd={onAdd}
        columns={roomColumns({
          onEdit,
        })}
        data={data}
        total={total}
        pageIndex={pageIndex}
        pageSize={pageSize}
        setPageIndex={setPageIndex}
        setPageSize={setPageSize}
      />

      <RoomModal
        formManager={formManager}
        handleSubmit={handleSubmit}
        onClose={onClose}
      ></RoomModal>
    </div>
  );
};

export default RoomTest;
