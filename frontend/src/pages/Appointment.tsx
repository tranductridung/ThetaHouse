import api from "@/api/api";
import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { appointmentColumns } from "@/components/columns/appointment-column";
import { handleAxiosError } from "@/lib/utils";
import type {
  AppointmentDraftType,
  AppointmentType,
} from "@/components/schemas/appointment";
import AppointmentForm from "@/components/forms/AppointmentForm";
import { toast } from "sonner";

export type FormManagerType = {
  isShow: boolean;
  type: "add" | "edit";
  data: AppointmentType | null;
};

const Appointment = () => {
  const [data, setData] = useState<AppointmentType[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const [formManager, setFormManager] = useState<FormManagerType>({
    isShow: false,
    type: "add",
    data: null,
  });

  const handleSubmitEdit = async (formData: AppointmentDraftType) => {
    console.log("formData edit", formData);
    const newModules: number[] = formData.modules?.map((m) => m.id) ?? [];

    const payload = {
      note: formData.note,
      customerId: formData.customer.id,
      type: formData.type,
      startAt: formData?.startAt?.toISOString(),
      roomId: formData.room?.id || undefined,
      healerId: formData.healer?.id || undefined,
      moduleIds: newModules,
    };

    try {
      const response = await api.patch(
        `/appointments/${formManager?.data?.id}`,
        payload
      );
      setData((prev) =>
        prev.map((appointment) =>
          appointment.id === formManager.data?.id
            ? response.data.appointment
            : appointment
        )
      );
      setFormManager({
        isShow: false,
        type: "add",
        data: null,
      });
      toast.success("Update appointment success!");
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const onEdit = (appointment: AppointmentType) => {
    setFormManager({
      isShow: true,
      type: "edit",
      data: appointment,
    });
  };

  useEffect(() => {
    try {
      const fetchData = async () => {
        const response = await api.get(
          `/appointments/all?page=${pageIndex}&limit=${pageSize}`
        );
        setData(response.data.appointments);
        setTotal(response.data.total);
      };
      fetchData();
    } catch (error) {
      handleAxiosError(error);
    }
  }, []);

  return (
    <div className="p-4">
      <DataTable
        onAdd={undefined}
        columns={appointmentColumns({
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
        modal={false}
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
        <DialogContent
          onInteractOutside={(event) => {
            if (isSelectOpen) {
              event.preventDefault();
            }
          }}
        >
          <DialogTitle></DialogTitle>
          <AppointmentForm
            onSubmit={handleSubmitEdit}
            appointmentData={formManager.data}
            type={formManager.type}
            setIsSelectOpen={setIsSelectOpen}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Appointment;
