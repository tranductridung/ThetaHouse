import api from "@/api/api";
import type { SourceType } from "@/components/constants/constants";
import type { AppointmentDraftType } from "@/components/schemas/appointment";
import type { CreateItemType, ItemDraftType } from "@/components/schemas/item";
import { handleAxiosError } from "@/lib/utils";
import { toast } from "sonner";

export const useItemActions = (refetch: () => void) => {
  const handleExportImport = async (
    itemId: number,
    sourceId: number,
    sourceType: SourceType
  ) => {
    console.log("Handle Export Import", itemId, sourceId, sourceType);
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
    handleExportImport,
  };
};
