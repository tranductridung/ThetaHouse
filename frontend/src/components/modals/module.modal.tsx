import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import ModuleForm from "../forms/module.form";
import type { CombineFormManagerType } from "@/types/form";
import type {
  CreateModuleFormType,
  EditModuleFormType,
  ModuleType,
} from "@/components/schemas/module.schema";

type ModuleModalProps = {
  formManager: CombineFormManagerType<ModuleType>;
  handleSubmit: (formData: CreateModuleFormType | EditModuleFormType) => void;
  onClose: () => void;
};

const ModuleModal = ({
  formManager,
  onClose,
  handleSubmit,
}: ModuleModalProps) => {
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
        <ModuleForm
          moduleData={formManager.data}
          onSubmit={handleSubmit}
          type={formManager.type}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ModuleModal;
