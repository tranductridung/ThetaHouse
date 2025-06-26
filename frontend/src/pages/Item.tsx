import api from "@/api/api";
import { itemColumns } from "@/components/columns/item-column";
import { DataTable } from "@/components/data-table";
import type { ItemType } from "@/components/schemas/item";
import { useItemActions } from "@/hooks/useItemAction";
import { handleAxiosError } from "@/lib/utils";
import { useEffect, useState } from "react";

const Item = () => {
  const [data, setData] = useState<ItemType[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [openCreateAppointment, setOpenCreateAppointment] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      const response = await api.get(
        `/items?page=${pageIndex}&limit=${pageSize}`
      );
      setData(response.data.items);
      setTotal(response.data.total);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const onAdd = () => {
    console.log("item");
  };

  const { onEdit, onRemove, handleCreateAppointmnet } =
    useItemActions(fetchData);

  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize]);

  // Open create appointment dialog
  const onCreateAppointment = (id: number) => {
    console.log("on create appointment:", id);
    setOpenCreateAppointment(true);
  };

  return (
    <div className="p-4">
      <DataTable
        columns={itemColumns({
          onEdit,
          onCreateAppointment,
          onRemove,
        })}
        data={data}
        onAdd={onAdd}
        total={total}
        pageIndex={pageIndex}
        pageSize={pageSize}
        setPageIndex={setPageIndex}
        setPageSize={setPageSize}
      />

      {/* <Dialog
        open={openCreateAppointment}
        modal={false}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setOpenCreateAppointment(false);
          }
        }}
      >
        <DialogContent
          onInteractOutside={(event) => {
            if (isSelectOpen) {
              event.preventDefault();
            }
          }}
        >
          <DialogTitle></DialogTitle>
          <AppointmentForm
            onSubmit={onSubmitCreateAppointment}
            appointmentData={null}
            type={"add"}
            setIsSelectOpen={setIsSelectOpen}
          />
        </DialogContent>
      </Dialog> */}
    </div>
  );
};

export default Item;
