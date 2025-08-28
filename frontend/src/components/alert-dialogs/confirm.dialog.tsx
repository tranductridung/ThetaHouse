import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Dispatch, SetStateAction } from "react";

type ConfirmDialogProps = {
  type: "order" | "purchase" | "consignment";
  selectedId: number | null;
  showConfirmDialog: boolean;
  setShowConfirmDialog: Dispatch<SetStateAction<boolean>>;
  handleCancel: (id: number) => void;
};
const ConfirmDialog = ({
  type,
  showConfirmDialog,
  setShowConfirmDialog,
  handleCancel,
  selectedId,
}: ConfirmDialogProps) => {
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
            <AlertDialogAction
              onClick={() => {
                if (typeof selectedId === "number") {
                  handleCancel(selectedId);
                }
              }}
            >
              Confirm Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ConfirmDialog;
