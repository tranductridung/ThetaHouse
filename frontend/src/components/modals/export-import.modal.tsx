import type { CreateFormManagerType } from "@/types/form";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import ExportImportForm from "../forms/export-import.form";

type ExportImportModalProps = {
  formManager: CreateFormManagerType;
  handleSubmit: (quantity: number) => void;
  onClose: () => void;
};

const ExportImportModal = ({
  formManager,
  handleSubmit,
  onClose,
}: ExportImportModalProps) => {
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
          <ExportImportForm onSubmit={handleSubmit} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExportImportModal;
