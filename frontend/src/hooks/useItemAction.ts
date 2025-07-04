import api from "@/api/api";
import type {
  SourceType,
  TypeOfConsignment,
} from "@/components/constants/constants";
import type { AppointmentDraftType } from "@/components/schemas/appointment";
import type { CreateItemType, ItemDraftType } from "@/components/schemas/item";
import { handleAxiosError } from "@/lib/utils";
import { toast } from "sonner";

export const useItemActions = (refetch: () => void) => {
  const handleExportImportItem = async (
    itemId: number,
    sourceType: SourceType,
    quantity?: number,
    consignmentType?: TypeOfConsignment
  ) => {
    console.log("handleExportImportItem", quantity);
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
      const response = await api.post(url, { quantity });
      console.log(response);
      refetch();
      toast.success(`${action} item success!`);
    } catch (error) {
      handleAxiosError(error);
    }

    console.log("Handle Export Import", itemId, sourceType);
  };

  const handleRemove = async (
    itemId: number,
    sourceId: number,
    sourceType: SourceType
  ) => {
    try {
      const response = await api.delete(
        `${sourceType}s/${sourceId}/items/${itemId}`
      );
      refetch();

      console.log(response);
      toast.success("Remove item success!");
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleCreateAppointmnet = async (
    formData: AppointmentDraftType,
    selectedItemId: number
  ) => {
    console.log("form data", formData);

    const newModules: number[] = formData.modules?.map((m) => m.id) ?? [];

    const payload = {
      note: formData.note,
      customerId: formData.customer.id,
      type: formData.type,
      startAt: formData.startAt,
      roomId: formData.room?.id || undefined,
      healerId: formData.healer?.id || undefined,
      moduleIds: newModules,
      itemId: selectedItemId,
    };

    try {
      const response = await api.post(`/appointments`, payload);
      console.log("response", response);
      toast.success("Create appointment success!");
      return response;
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleAddItem = async (
    itemDraftType: ItemDraftType,
    sourceId: number,
    sourceType: SourceType
  ) => {
    const payload: CreateItemType = {
      itemableId: itemDraftType.itemableId,
      itemableType: itemDraftType.itemableType,
      quantity: itemDraftType.quantity,
      discountId: itemDraftType.discount?.id,
    };

    try {
      const response = await api.post(
        `${sourceType}s/${sourceId}/items`,
        payload
      );
      console.log(response);
      refetch();
    } catch (error) {
      handleAxiosError(error);
    }
  };

  return {
    handleAddItem,
    handleRemove,
    handleCreateAppointmnet,
    handleExportImportItem,
  };
};
