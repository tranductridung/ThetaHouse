import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import type { Dispatch, SetStateAction } from "react";

type ConfirmCancelSourceDialogProps = {
  type: "order" | "purchase" | "consignment";
  selectedId?: number;
  showConfirmDialog: boolean;
  setShowConfirmDialog: Dispatch<SetStateAction<boolean>>;
  handleCancel: (id?: number) => void;
};
const ConfirmCancelSourceDialog = ({
  type,
  showConfirmDialog,
  setShowConfirmDialog,
  handleCancel,
  selectedId,
}: ConfirmCancelSourceDialogProps) => {
  return (
    <>
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you absolutely sure to cancel this {type}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The {type} will be permanently
              cancelled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {typeof selectedId === "number" && (
              <AlertDialogAction onClick={() => handleCancel(selectedId)}>
                Confirm Cancel
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ConfirmCancelSourceDialog;
