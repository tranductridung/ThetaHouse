import type {
  AppointmentDraftType,
  AppointmentType,
} from "@/components/schemas/appointment.schema";
import api from "@/api/api";
import PageTitle from "@/components/Title";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { useAptAction } from "@/hooks/useAptAction";
import AppointmentForm from "@/components/forms/appointment.form";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { appointmentColumns } from "@/components/columns/appointment.column";
import type { AppointmentCategory } from "@/components/constants/constants";

export type FormManagerType = {
  isShow: boolean;
  type: "add" | "edit" | "addFree" | "consultation" | "editConsultation";
  data: AppointmentType | null;
};

type AppointmentProps = {
  customerId?: number;
  appointmentCategory?: AppointmentCategory;
  isUseTitle?: boolean;
};

const Appointment = ({
  customerId,
  appointmentCategory,
  isUseTitle = true,
}: AppointmentProps) => {
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

  const handleSubmit = async (formData: AppointmentDraftType) => {
    let isSuccess: boolean = false;
    if (
      formManager.type === "edit" ||
      formManager.type === "editConsultation"
    ) {
      isSuccess = await handleSubmitEdit(formData, formManager?.data?.id);
    } else if (
      formManager.type === "addFree" ||
      formManager.type === "consultation"
    ) {
      isSuccess = await handleCreateAppointment(
        formData,
        formManager.type,
        undefined,
        customerId
      );
    }

    if (isSuccess) {
      setFormManager({
        isShow: false,
        type: "add",
        data: null,
      });
    }
  };

  const onEdit = (appointment: AppointmentType) => {
    setFormManager({
      isShow: true,
      type: "edit",
      data: appointment,
    });
  };

  const fetchData = async () => {
    let url;
    if (customerId) {
      url = appointmentCategory
        ? `/partners/customers/${customerId}/appointments/${appointmentCategory}?page=${pageIndex}&limit=${pageSize}`
        : `/partners/customers/${customerId}/appointments?page=${pageIndex}&limit=${pageSize}`;
    } else url = `/appointments/all?page=${pageIndex}&limit=${pageSize}`;

    const response = await api.get(url);
    setData(response.data.appointments);
    setTotal(response.data.total);
  };

  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize]);

  const {
    handleCreateAppointment,
    handleSubmitEdit,
    handleSetComplete,
    removeAppointment,
  } = useAptAction(fetchData);

  const onCreateFree = () => {
    setFormManager({
      isShow: true,
      type: "addFree",
      data: null,
    });
  };
  const onCreateConsultation = () => {
    setFormManager({
      isShow: true,
      type: "consultation",
      data: null,
    });
  };

  return (
    <div className="p-4">
      {isUseTitle && <PageTitle title="Appointment"></PageTitle>}

      {customerId && appointmentCategory === "Consultation" && (
        <Button type="button" onClick={onCreateConsultation} className="w-fit">
          Book Consultation Appointment
        </Button>
      )}

      {customerId && appointmentCategory === "Therapy" && (
        <Button type="button" onClick={onCreateFree} className="w-fit">
          Book Free Appointment
        </Button>
      )}

      <DataTable
        onAdd={undefined}
        columns={appointmentColumns({
          onEdit,
          handleSetComplete,
          onRemove: removeAppointment,
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
            onSubmit={handleSubmit}
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
