import RoleForm from "../forms/role.form";
import type { CombineFormManagerType } from "@/types/form";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import type { RoleFormType, RoleType } from "../schemas/role.schema";

type RoleModalProps = {
  formManager: CombineFormManagerType<RoleType>;
  handleSubmit: (formData: RoleFormType) => void;
  onClose: () => void;
};

const RoleModal = ({ formManager, handleSubmit, onClose }: RoleModalProps) => {
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
        <RoleForm
          roleData={formManager.data}
          onSubmit={handleSubmit}
          type={formManager.type}
        />
      </DialogContent>
    </Dialog>
  );
};

export default RoleModal;
