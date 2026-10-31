import api from "@/api/api";
import { useEffect, useState } from "react";
import type { CreateFormManagerType } from "@/types/form";
import ExportImportForm from "../forms/export-import.form";
import type { SourceTypeConst } from "../constants/constants";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";

type ExportImportModalProps = {
  formManager: CreateFormManagerType;
  handleSubmit: (quantity: number) => void;
  onClose: () => void;
  itemId: number;
  sourceType: SourceTypeConst;
  sourceId: number | undefined;
};

const ExportImportModal = ({
  formManager,
  handleSubmit,
  onClose,
  itemId,
  sourceType,
  sourceId,
}: ExportImportModalProps) => {
  const [unexportQuantity, setUnexportQuantity] = useState<number>(0);

  useEffect(() => {
    const run = async () => {
      const response = await api.get(
        `/${(
          sourceType as string
        ).toLowerCase()}s/${sourceId}/items/${itemId}/remain`
      );
      setUnexportQuantity(response.data.unprocessedQuantity);
    };

    run();
  });
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
          <ExportImportForm
            onSubmit={handleSubmit}
            maxQuantity={unexportQuantity}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExportImportModal;
