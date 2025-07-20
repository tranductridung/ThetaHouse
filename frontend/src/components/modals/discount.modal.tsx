import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import DiscountForm from "../forms/discount.form";
import type { CombineFormManagerType } from "@/types/form";
import type {
  CreateDiscountFormType,
  EditDiscountFormType,
  DiscountType,
} from "@/components/schemas/discount.schema";

type DiscountModalProps = {
  formManager: CombineFormManagerType<DiscountType>;
  handleSubmit: (
    formData: CreateDiscountFormType | EditDiscountFormType
  ) => void;
  onClose: () => void;
};

const DiscountModal = ({
  formManager,
  onClose,
  handleSubmit,
}: DiscountModalProps) => {
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
        <DiscountForm
          discountData={formManager.data}
          onSubmit={handleSubmit}
          type={formManager.type}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DiscountModal;
