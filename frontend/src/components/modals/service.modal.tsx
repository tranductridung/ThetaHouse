import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import ServiceForm from "../forms/service.form";
import type { CombineFormManagerType } from "@/types/form";
import type {
  CreateServiceFormType,
  EditServiceFormType,
  ServiceType,
} from "@/components/schemas/service.schema";

type ServiceModalProps = {
  formManager: CombineFormManagerType<ServiceType>;
  handleSubmit: (formData: CreateServiceFormType | EditServiceFormType) => void;
  onClose: () => void;
};

const ServiceModal = ({
  formManager,
  onClose,
  handleSubmit,
}: ServiceModalProps) => {
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
        <ServiceForm
          serviceData={formManager.data}
          onSubmit={handleSubmit}
          type={formManager.type}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ServiceModal;
