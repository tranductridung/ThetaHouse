import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { type Dispatch, type SetStateAction } from "react";

type ConfirmExportImportSourceProps = {
  type: "order" | "purchase" | "consignment";
  handleType: "import" | "export";
  showConfirmDialog: boolean;
  setShowConfirmDialog: Dispatch<SetStateAction<boolean>>;
  handleConfirm: () => void;
  data: HandledItemListType[];
};

export type HandledItemListType = {
  itemId: number;
  productName: string;
  handledQuantity: number;
  totalQuantity: number;
};

const ConfirmExportImportSourceDialog = ({
  type,
  showConfirmDialog,
  setShowConfirmDialog,
  handleConfirm,
  data,
  handleType,
}: ConfirmExportImportSourceProps) => {
  return (
    <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm export for this {type}?</AlertDialogTitle>

          <AlertDialogDescription>
            You are about to {handleType} all items in this {type}. Please
            review the quantities below before proceeding:
          </AlertDialogDescription>
        </AlertDialogHeader>

        {data.map((item) => {
          if (item)
            return (
              <div
                key={item.itemId}
                className="text-sm text-muted-foreground mt-1"
              >
                • {item.productName}:{" "}
                {item.totalQuantity - item.handledQuantity}/{item.totalQuantity}
              </div>
            );
        })}

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            {handleType[0].toUpperCase() + handleType.slice(1).toLowerCase()}{" "}
            now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmExportImportSourceDialog;
