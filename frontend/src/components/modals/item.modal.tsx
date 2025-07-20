import type { CreateFormManagerType } from "@/types/form";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import type { ItemDraftType } from "../schemas/item.schema";
import AddItemForm from "../forms/add-item.form";

type ItemModalProps = {
  formManager: CreateFormManagerType;
  handleSubmit: (data: ItemDraftType) => void;
  onClose: () => void;
};

const ItemModal = ({ formManager, handleSubmit, onClose }: ItemModalProps) => {
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
          <AddItemForm onSubmit={handleSubmit} isService={true} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ItemModal;
