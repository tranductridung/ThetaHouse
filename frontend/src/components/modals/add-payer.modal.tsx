import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import AddPayerForm from "../forms/add-payer.form";
import type { AddPayerType } from "../schemas/add-payer.schema";
import type { Dispatch, SetStateAction } from "react";

type AddPayerModalProps = {
  type: "order" | "purchase" | "consignment";
  onSubmitAddPayer: (formData: AddPayerType) => void;
  showPayerDialog: boolean;
  setShowPayerDialog: Dispatch<SetStateAction<boolean>>;
};

const AddPayerModal = ({
  type,
  onSubmitAddPayer,
  showPayerDialog,
  setShowPayerDialog,
}: AddPayerModalProps) => {
  return (
    <Dialog open={showPayerDialog} onOpenChange={setShowPayerDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choose Payer</DialogTitle>
          <DialogDescription>
            Please select who will be responsible for the refund transaction
            before cancelling this {type}.
          </DialogDescription>
        </DialogHeader>

        <AddPayerForm onSubmit={onSubmitAddPayer}></AddPayerForm>
      </DialogContent>
    </Dialog>
  );
};

export default AddPayerModal;
