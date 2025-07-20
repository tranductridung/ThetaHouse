import AppointmentForm from "../forms/appointment.form";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import type { AppointmentDraftType } from "../schemas/appointment.schema";
import { useState } from "react";
import type { SelectedItemFormManagerType } from "@/types/form";

type AppointmentModalProps = {
  formManager: SelectedItemFormManagerType;
  onClose: () => void;
  onSubmitAddAppointment: (formData: AppointmentDraftType) => void;
};

const AppointmentModal = ({
  formManager,
  onClose,
  onSubmitAddAppointment,
}: AppointmentModalProps) => {
  const [isSelectOpen, setIsSelectOpen] = useState<boolean>(false);
  return (
    <>
      <Dialog
        open={formManager.isShow}
        modal={false}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            onClose();
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
            onSubmit={onSubmitAddAppointment}
            appointmentData={null}
            type={"add"}
            setIsSelectOpen={setIsSelectOpen}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AppointmentModal;
