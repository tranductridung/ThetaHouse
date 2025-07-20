import type { CreateFormManagerType } from "@/types/form";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import TransactionForm from "../forms/transaction.form";
import type { CreateTransactionType } from "../schemas/transaction.schema";

type TransactionModalProps = {
  formManager: CreateFormManagerType;
  onClose: () => void;
  handleSubmit: (formData: CreateTransactionType) => void;
};

const TransactionModal = ({
  formManager,
  onClose,
  handleSubmit,
}: TransactionModalProps) => {
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
          <TransactionForm onSubmit={handleSubmit} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TransactionModal;
