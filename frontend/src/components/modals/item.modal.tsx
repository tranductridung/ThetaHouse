import type { CreateFormManagerType } from "@/types/form";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import AddItemForm from "../forms/add-item.form";
import type { ItemDraftListType } from "../schemas/item.schema";

type ItemModalProps = {
  formManager: CreateFormManagerType;
  handleSubmit: (itemDraftList: ItemDraftListType) => void;
  onClose: () => void;
  source: "Order" | "Purchase" | "Consignment";
  consignmentType?: "In" | "Out";
};

const ItemModal = ({
  formManager,
  handleSubmit,
  onClose,
  source,
  consignmentType,
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
        <DialogContent className="max-h-[90vh]">
          <DialogTitle>ADD ITEM</DialogTitle>
          <AddItemForm
            onSubmit={handleSubmit}
            source={source}
            consignmentType={consignmentType}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ItemModal;
