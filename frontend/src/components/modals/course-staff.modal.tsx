import type { CreateFormManagerType } from "@/types/form";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import type { CourseStaffType, CourseType } from "../schemas/course.schema";
import CourseStaffForm from "../forms/course-staff.form";

type CourseStaffModalProps = {
  currentCourse?: CourseType;
  formManager: CreateFormManagerType;
  handleSubmit: (formData: CourseStaffType) => void;
  onClose: () => void;
};

const CourseStaffModal = ({
  currentCourse,
  formManager,
  onClose,
  handleSubmit,
}: CourseStaffModalProps) => {
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
        <CourseStaffForm
          onSubmit={handleSubmit}
          currentCourse={currentCourse}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CourseStaffModal;
