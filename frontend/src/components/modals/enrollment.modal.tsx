import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import EnrollmentForm from "../forms/enrollment.form";
import type { EditFormManagerType } from "@/types/form";
import type {
  EditEnrollmentFormType,
  EnrollmentType,
} from "@/components/schemas/enrollment.schema";

type EnrollmentModalProps = {
  formManager: EditFormManagerType<EnrollmentType>;
  handleSubmit: (formData: EditEnrollmentFormType) => void;
  onClose: () => void;
};

const EnrollmentModal = ({
  formManager,
  onClose,
  handleSubmit,
}: EnrollmentModalProps) => {
  return (
    <Dialog
      open={formManager.isShow}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogTitle></DialogTitle>
        <EnrollmentForm
          enrollmentData={formManager.data}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EnrollmentModal;
