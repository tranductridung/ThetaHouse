import api from "@/api/api";
import { itemColumns } from "@/components/columns/item.column";
import { DataTable } from "@/components/data-table";
import type { ItemType } from "@/components/schemas/item.schema";
import PageTitle from "@/components/Title";
import { useItemActions } from "@/hooks/useItemAction";
import { handleAxiosError } from "@/lib/utils";
import { useEffect, useState } from "react";

type ItemProps = { isUseTitle?: boolean };

const Item = ({ isUseTitle = true }: ItemProps) => {
  const [data, setData] = useState<ItemType[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [openCreateAppointment, setOpenCreateAppointment] = useState(false);

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

  const { onEdit, onRemove } = useItemActions(fetchData);

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
      {isUseTitle && <PageTitle title="Item"></PageTitle>}

      <DataTable
        columns={itemColumns({
          onRemove,
          onEdit,
          undefined,
          onCreateAppointment,
        })}
        data={data}
        onAdd={undefined}
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
