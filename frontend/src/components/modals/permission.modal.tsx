import type { CombineFormManagerType } from "@/types/form";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import type {
  PermissionFormType,
  PermissionType,
} from "../schemas/permission.schema";
import PermissionForm from "../forms/permission.form";

type PermissionModalProps = {
  formManager: CombineFormManagerType<PermissionType>;
  handleSubmit: (formData: PermissionFormType) => void;
  onClose: () => void;
};

const PermissionModal = ({
  formManager,
  handleSubmit,
  onClose,
}: PermissionModalProps) => {
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
        <PermissionForm
          permissionData={formManager.data}
          onSubmit={handleSubmit}
          type={formManager.type}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PermissionModal;
