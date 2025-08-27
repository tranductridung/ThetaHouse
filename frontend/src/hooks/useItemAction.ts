import api from "@/api/api";
import type {
  ConsignmentTypeConst,
  SourceTypeConst,
} from "@/components/constants/constants";
import type { AppointmentDraftType } from "@/components/schemas/appointment.schema";
import type {
  CreateItemType,
  ItemDraftListType,
} from "@/components/schemas/item.schema";
import { handleAxiosError } from "@/lib/utils";
import { toast } from "sonner";

export const useItemActions = (refetch: () => void) => {
  const handleExportImportItem = async (
    itemId: number,
    sourceType: SourceTypeConst,
    quantity?: number,
    consignmentType?: ConsignmentTypeConst
  ) => {
    let url;
    let action;
    switch (sourceType) {
      case "Order":
        url = `orders/items/${itemId}/export`;
        action = "Export";
        break;
      case "Purchase":
        url = `purchases/items/${itemId}/import`;
        action = "Import";
        break;
      case "Consignment":
        url = `consignments/items/${itemId}/handle`;
        action = consignmentType === "In" ? "Import" : "Export";
        break;
    }

    if (!url) {
      throw new Error(`Invalid source!`);
    }

    try {
      await api.post(url, { quantity });
      refetch();
      toast.success(`${action} item success!`);
      return true;
    } catch (error) {
      handleAxiosError(error);
      return false;
    }
  };

  const handleRemove = async (
    itemId: number,
    sourceId: number,
    sourceType: SourceTypeConst
  ) => {
    try {
      await api.delete(`${sourceType}s/${sourceId}/items/${itemId}`);
      refetch();
      toast.success("Remove item success!");
      return true;
    } catch (error) {
      handleAxiosError(error);
      return false;
    }
  };

  const handleCreateAppointmnet = async (
    formData: AppointmentDraftType,
    selectedItemId?: number
  ) => {
    const newModules: number[] = formData.modules?.map((m) => m.id) ?? [];

    const payload = {
      note: formData.note,
      type: formData.type,
      startAt: formData.startAt,
      roomId: formData.room?.id || undefined,
      healerId: formData.healer?.id || undefined,
      moduleIds: newModules,
      itemId: selectedItemId,
    };

    try {
      const response = await api.post(`/appointments/therapy`, payload);
      toast.success("Create appointment success!");

      const calendar = response.data.calendar;

      if (!calendar) {
        toast.error("No response received from Google Calendar!");
      } else if (calendar.status === "success") {
        toast.success(
          "Appointment has been added to the healer's Google Calendar!"
        );
      } else if (calendar.status === "not_connected") {
        toast.warning(
          "Google Calendar is not connected. Please connect it in your profile settings!"
        );
      } else {
        toast.error(
          "Failed to create Google Calendar event. Please try again later!"
        );
      }

      return true;
    } catch (error) {
      handleAxiosError(error);
      return false;
    }
  };

  const handleAddItemList = async (
    itemDraftList: ItemDraftListType,
    sourceId: number,
    sourceType: SourceTypeConst
  ) => {
    const payload: CreateItemType[] = [];
    for (const item of itemDraftList.items) {
      payload.push({
        itemableId: item.itemableId,
        itemableType: item.itemableType,
        quantity: item.quantity,
        discountId: item.discount?.id,
        unitPrice: item.unitPrice,
      });
    }

    try {
      await api.post(`${sourceType}s/${sourceId}/items`, payload);
      toast.success("Add item success!");
      refetch();
      return true;
    } catch (error) {
      handleAxiosError(error);
      return false;
    }
  };

  return {
    handleAddItemList,
    handleRemove,
    handleCreateAppointmnet,
    handleExportImportItem,
  };
};
