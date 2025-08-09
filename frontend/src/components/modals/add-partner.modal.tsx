import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import AddPartnerForm from "../forms/add-partner.form";
import type { AddPartnerType } from "../schemas/add-partner.schema";
import type { Dispatch, SetStateAction } from "react";

type AddPartnerModalProps = {
  onSubmitAddPartner: (formData: AddPartnerType) => void;
  showPartnerDialog: boolean;
  setShowPartnerDialog: Dispatch<SetStateAction<boolean>>;
};

const AddPartnerModal = ({
  onSubmitAddPartner,
  showPartnerDialog,
  setShowPartnerDialog,
}: AddPartnerModalProps) => {
  return (
    <Dialog open={showPartnerDialog} onOpenChange={setShowPartnerDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choose partner</DialogTitle>
          <DialogDescription>
            Please select the customer of this service. After the transfer, the
            new customer will not be able to use the bonus sessions of the
            service.
          </DialogDescription>
        </DialogHeader>

        <AddPartnerForm onSubmit={onSubmitAddPartner}></AddPartnerForm>
      </DialogContent>
    </Dialog>
  );
};

export default AddPartnerModal;
