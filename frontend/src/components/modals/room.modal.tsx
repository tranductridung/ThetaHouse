import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import RoomForm from "../forms/room.form";
import type { CombineFormManagerType } from "@/types/form";
import type { RoomFormType, RoomType } from "../schemas/room.schema";

type RoomModalProps = {
  formManager: CombineFormManagerType<RoomType>;
  handleSubmit: (formData: RoomFormType) => void;
  onClose: () => void;
};

const RoomModal = ({ formManager, handleSubmit, onClose }: RoomModalProps) => {
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
        <RoomForm
          roomData={formManager.data}
          onSubmit={handleSubmit}
          type={formManager.type}
        />
      </DialogContent>
    </Dialog>
  );
};

export default RoomModal;
