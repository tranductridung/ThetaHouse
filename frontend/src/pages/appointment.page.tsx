import api from "@/api/api";
import { DataTable } from "@/components/data-table";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { appointmentColumns } from "@/components/columns/appointment.column";
import type {
  AppointmentDraftType,
  AppointmentType,
} from "@/components/schemas/appointment.schema";
import { useAptAction } from "@/hooks/useAptAction";
import PageTitle from "@/components/Title";
import AppointmentModal from "@/components/modals/appointment.modal";

export type FormManagerType = {
  isShow: boolean;
  type: "add" | "edit" | "addFree";
  data: AppointmentType | null;
};

type AppointmentProps = {
  customerId?: number;
  isUseTitle?: boolean;
};

const Appointment = forwardRef(
  ({ customerId, isUseTitle = true }: AppointmentProps, ref) => {
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

    useImperativeHandle(ref, () => ({
      openDialog: () => {
        setFormManager({
          isShow: true,
          type: "addFree",
          data: null,
        });
      },
    }));

    const handleSubmit = async (formData: AppointmentDraftType) => {
      if (formManager.type === "edit") {
        handleSubmitEdit(formData, formManager?.data?.id);

        setFormManager({
          isShow: false,
          type: "add",
          data: null,
        });
      } else {
        handleCreateAppointmnet(formData, customerId);
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
      const url = customerId
        ? `/partners/customers/${customerId}/appointments?page=${pageIndex}&limit=${pageSize}`
        : `/appointments/all?page=${pageIndex}&limit=${pageSize}`;

      const response = await api.get(url);
      setData(response.data.appointments);
      setTotal(response.data.total);
    };

    useEffect(() => {
      fetchData();
    }, [pageIndex, pageSize]);

    const {
      handleCreateAppointmnet,
      handleSubmitEdit,
      handleSetComplete,
      removeAppointment,
    } = useAptAction(fetchData);

    return (
      <div className="p-4">
        {isUseTitle && <PageTitle title="Appointment"></PageTitle>}

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

        <AppointmentModal
          formManager={formManager}
          setFormManager={setFormManager}
          isSelectOpen={isSelectOpen}
          setIsSelectOpen={setIsSelectOpen}
          handleSubmit={handleSubmit}
        ></AppointmentModal>

        {/* <Dialog
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
        </Dialog> */}
      </div>
    );
  }
);

export default Appointment;
