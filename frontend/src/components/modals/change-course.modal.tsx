import type { SelectedItemFormManagerType } from "@/types/form";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import ChangeCourseForm, {
  type ChangeCourseFormData,
} from "../forms/change-course.form";

type ChangeCourseModalProps = {
  formManager: SelectedItemFormManagerType;
  handleSubmit: (formData: ChangeCourseFormData) => void;
  onClose: () => void;
};

const ChangeCourseModal = ({
  formManager,
  handleSubmit,
  onClose,
}: ChangeCourseModalProps) => {
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
        <DialogContent>
          <DialogTitle></DialogTitle>
          <ChangeCourseForm onSubmit={handleSubmit} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChangeCourseModal;
