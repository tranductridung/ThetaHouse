import type { CreateFormManagerType } from "@/types/form";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import type { PaymentDraftType } from "../schemas/payment.schema";
import PaymentForm from "../forms/payment.form";

type PaymentModalProps = {
  formManager: CreateFormManagerType;
  handleSubmit: (data: PaymentDraftType) => void;
  onClose: () => void;
};

const PaymentModal = ({
  formManager,
  handleSubmit,
  onClose,
}: PaymentModalProps) => {
  return (
    <>
      <Dialog
        open={formManager.isShow}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            onClose();
          }
        }}
      >
        <DialogContent className="max-h-[80vh] overflow-y-auto overflow-x-auto">
          <DialogTitle></DialogTitle>
          <PaymentForm onSubmit={handleSubmit} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PaymentModal;
