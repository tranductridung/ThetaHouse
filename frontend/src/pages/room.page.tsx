import api from "@/api/api";
import { toast } from "sonner";
import { useAuth } from "@/auth/useAuth";
import PageTitle from "@/components/Title";
import { useEffect, useState } from "react";
import { handleAxiosError } from "@/lib/utils";
import { DataTable } from "@/components/data-table";
import RoomModal from "@/components/modals/room.modal";
import { roomColumns } from "@/components/columns/room.column";
import { useLoading } from "@/components/contexts/loading.context";
import { useCombineFormManager } from "@/hooks/use-custom-manager";
import { RequirePermission } from "@/components/commons/require-permission";
import type { RoomFormType, RoomType } from "@/components/schemas/room.schema";

type RoomProps = {
  isUseTitle?: boolean;
};

const RoomTest = ({ isUseTitle = true }: RoomProps) => {
  const { setLoading } = useLoading();
  const { fetchPermissions } = useAuth();

  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [data, setData] = useState<RoomType[]>([]);

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
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        await fetchPermissions(["room"]);
        await fetchData();
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [pageIndex, pageSize]);

  return (
    <div className="p-4">
      {isUseTitle && <PageTitle title="Room"></PageTitle>}
      <RequirePermission permission="room:read">
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
          permission={"room:create"}
        />
      </RequirePermission>
      <RoomModal
        formManager={formManager}
        handleSubmit={handleSubmit}
        onClose={onClose}
      ></RoomModal>
    </div>
  );
};

export default RoomTest;
