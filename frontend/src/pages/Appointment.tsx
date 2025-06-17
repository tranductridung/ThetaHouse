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

  const [formManager, setFormManager] = useState<FormManagerType>({
    isShow: false,
    type: "add",
    data: null,
  });

  const handleSubmit = async (formData: AppointmentDraftType) => {
    try {
      if (formManager.type === "add") {
        const response = await api.post("/appointments", formData);
        setData((prev) => [...prev, response.data.appointment]);
      } else if (formManager.type === "edit" && formManager.data?.id) {
        const response = await api.patch(
          `/appointments/${formManager.data.id}`,
          formData
        );
        setData((prev) =>
          prev.map((appointment) =>
            appointment.id === formManager.data?.id
              ? response.data.appointment
              : appointment
          )
        );
      }

      setFormManager({
        isShow: false,
        type: "add",
        data: null,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const onAdd = () => {
    setFormManager({
      isShow: true,
      type: "add",
      data: null,
    });
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
          `/appointments?page=${pageIndex}&limit=${pageSize}`
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
        onAdd={onAdd}
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
          <AppointmentForm
            onSubmit={handleSubmit}
            appointmentData={formManager.data}
            type={formManager.type}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Appointment;
