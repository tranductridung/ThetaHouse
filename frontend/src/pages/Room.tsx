import api from "@/api/api";
import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { RoomFormType, RoomType } from "@/components/schemas/room";
import { roomColumns } from "@/components/columns/room-column";
import RoomForm from "@/components/forms/RoomForm";
import { handleAxiosError } from "@/lib/utils";

export type FormManagerType = {
  isShow: boolean;
  type: "add" | "edit";
  data: RoomType | null;
};

const Room = () => {
  const [data, setData] = useState<RoomType[]>([]);
  const [formManager, setFormManager] = useState<FormManagerType>({
    isShow: false,
    type: "add",
    data: null,
  });
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const handleSubmit = async (formData: RoomFormType) => {
    console.log("formdata", formData);

    try {
      if (formManager.type === "add") {
        console.log("add", formData);

        const response = await api.post("/rooms", formData);
        console.log(response);
        setData((prev) => [...prev, response.data.room]);
      } else if (formManager.type === "edit" && formManager.data?.id) {
        console.log("edit", formData);

        const response = await api.patch(
          `/rooms/${formManager.data.id}`,
          formData
        );
        console.log(response);
        setData((prev) =>
          prev.map((room) =>
            room.id === formManager.data?.id ? response.data.room : room
          )
        );
      }

      setFormManager({
        isShow: false,
        type: "add",
        data: null,
      });
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const onAdd = () => {
    setFormManager({
      isShow: true,
      type: "add",
      data: null,
    });
  };

  const onEdit = (room: RoomType) => {
    setFormManager({
      isShow: true,
      type: "edit",
      data: room,
    });
  };

  // const handleDelete = async (id: number) => {
  //   try {
  //     await api.delete(`/rooms/${id}`);
  //     setData((prev) =>
  //       prev.map((room) =>
  //         room.id === id ? { ...room, status: "Deleted" } : room
  //       )
  //     );
  //     toast.success("Room is deleted!");
  //   } catch (error) {
  //     handleAxiosError(error);
  //   }
  // };

  // const handleRestore = async (id: number) => {
  //   try {
  //     const response = await api.patch(`/rooms/${id}/restore`);
  //     console.log(response);
  //     setData((prev) =>
  //       prev.map((room) =>
  //         room.id === id ? { ...room, status: "Active" } : room
  //       )
  //     );
  //     toast.success("Room is restored!");
  //   } catch (error) {
  //     handleAxiosError(error);
  //   }
  // };

  // const handleToggle = async (id: number) => {
  //   try {
  //     await api.patch(`/rooms/${id}/toggle-status`);
  //     let newStatus = "";
  //     setData((prev) =>
  //       prev.map((room) => {
  //         if (room.id !== id) return room; // room not match

  //         if (room.status === "Active") {
  //           // Change status
  //           newStatus = "disabled";
  //           return { ...room, status: "Inactive" };
  //         }
  //         newStatus = "enabled";
  //         return { ...room, status: "Active" };
  //       })
  //     );
  //     toast.success(`Room is ${newStatus}!`);
  //   } catch (error) {
  //     handleAxiosError(error);
  //   }
  // };

  const handleDelete = (id: number) => {
    console.log("handleDelete", id);
  };
  const handleRestore = (id: number) => {
    console.log("handleRestore", id);
  };
  const handleToggle = (id: number) => {
    console.log("handleToggle", id);
  };

  useEffect(() => {
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

    fetchData();
  }, [pageIndex, pageSize]);

  return (
    <div className="p-4">
      <DataTable
        onAdd={onAdd}
        columns={roomColumns({
          handleDelete,
          handleRestore,
          handleToggle,
          onEdit,
        })}
        data={data}
        total={total}
        pageIndex={pageIndex}
        pageSize={pageSize}
        setPageIndex={setPageIndex}
        setPageSize={setPageSize}
      />

      <Dialog
        open={formManager.isShow}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setFormManager({
              isShow: false,
              type: "add",
              data: null,
            });
          }
        }}
      >
        <DialogContent>
          <DialogTitle></DialogTitle>
          <RoomForm
            roomData={formManager.data}
            onSubmit={handleSubmit}
            type={formManager.type}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Room;
