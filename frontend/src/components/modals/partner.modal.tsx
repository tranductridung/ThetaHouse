import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import PartnerForm from "../forms/partner.form";
import type { CombineFormManagerType } from "@/types/form";
import type {
  CreatePartnerFormType,
  EditPartnerFormType,
  PartnerType,
} from "@/components/schemas/partner.schema";

type PartnerModalProps = {
  formManager: CombineFormManagerType<PartnerType>;
  handleSubmit: (formData: CreatePartnerFormType | EditPartnerFormType) => void;
  onClose: () => void;
};

const PartnerModal = ({
  formManager,
  onClose,
  handleSubmit,
}: PartnerModalProps) => {
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
        <PartnerForm
          partnerData={formManager.data}
          onSubmit={handleSubmit}
          type={formManager.type}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PartnerModal;
