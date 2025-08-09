import type { CreateFormManagerType } from "@/types/form";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import AddItemForm from "../forms/add-item.form";
import type { ItemDraftListType } from "../schemas/item.schema";

type ItemModalProps = {
  formManager: CreateFormManagerType;
  handleSubmit: (itemDraftList: ItemDraftListType) => void;
  onClose: () => void;
  source: "Order" | "Purchase" | "Consignment";
};

const ItemModal = ({
  formManager,
  handleSubmit,
  onClose,
  source,
}: ItemModalProps) => {
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
          <AddItemForm onSubmit={handleSubmit} source={source} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ItemModal;
