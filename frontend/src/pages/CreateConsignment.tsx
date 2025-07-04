import api from "@/api/api";
import CreateConsignmentForm from "@/components/forms/CreateConsignmentForm";
import type { CreateItemType, ItemDraftType } from "@/components/schemas/item";
import type { PartnerType } from "@/components/schemas/partner";
import type { ProductType } from "@/components/schemas/product";
import type {
  ConsignmentDraftType,
  CreateConsignmentType,
} from "@/components/schemas/source";

import { handleAxiosError } from "@/lib/utils";
import { toast } from "sonner";
export default function CreateConsignmentPage() {
  const handleCreateConsignment = async (data: ConsignmentDraftType) => {
    const transformDraftToCreateItem = (
      draft: ItemDraftType
    ): CreateItemType => ({
      quantity: draft.quantity,
      itemableId: draft.itemableId,
      itemableType: draft.itemableType,
      unitPrice: draft.unitPrice,
    });

    const newItems: CreateItemType[] = data.items.map(
      transformDraftToCreateItem
    );

    const payload: CreateConsignmentType = {
      note: data.note,
      commissionRate: data.commissionRate,
      type: data.type,
      partnerId: data.partner?.id,
      items: newItems,
    };

    try {
      const response = await api.post("/consignments", payload);
      console.log("Create consignment:", response);
      toast.success("Create consignment success!");
    } catch (error) {
      handleAxiosError(error);
    }
  };

  return (
    <div className="md:max-w-[100%] max-w-[85%] mx-auto py-10 flex flex-col">
      <h1 className="font-bold flex justify-center text-2xl mb-5">
        Create Consignment
      </h1>
      <CreateConsignmentForm onSubmit={handleCreateConsignment} />
    </div>
  );
}
