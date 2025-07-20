import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import type { CreateFormManagerType } from "@/types/form";
import InventoryForm from "../forms/inventory.form";
import type { InventoryDraftType } from "../schemas/inventory.schema";

type InventoryModalProps = {
  formManager: CreateFormManagerType;
  handleSubmit: (formData: InventoryDraftType) => void;
  onClose: () => void;
};

const InventoryModal = ({
  formManager,
  onClose,
  handleSubmit,
}: InventoryModalProps) => {
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
        <InventoryForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
};

export default InventoryModal;
