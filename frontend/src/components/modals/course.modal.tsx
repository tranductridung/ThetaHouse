import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import CourseForm from "../forms/course.form";
import type { CombineFormManagerType } from "@/types/form";
import type {
  CourseFormType,
  CourseType,
} from "@/components/schemas/course.schema";

type CourseModalProps = {
  formManager: CombineFormManagerType<CourseType>;
  handleSubmit: (formData: CourseFormType) => void;
  onClose: () => void;
};

const CourseModal = ({
  formManager,
  onClose,
  handleSubmit,
}: CourseModalProps) => {
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
        <CourseForm
          courseData={formManager.data}
          onSubmit={handleSubmit}
          type={formManager.type}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CourseModal;
