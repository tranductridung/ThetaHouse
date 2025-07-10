import api from "@/api/api";
import CreatePurchaseForm from "@/components/forms/CreatePurchaseForm";
import type { CreateItemType, ItemDraftType } from "@/components/schemas/item";
import type {
  CreatePurchaseType,
  PurchaseDraftType,
} from "@/components/schemas/source";
import { handleAxiosError } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function CreatePurchasePage() {
  const navigate = useNavigate();

  const handleCreatePurchase = async (data: PurchaseDraftType) => {
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

    const payload: CreatePurchaseType = {
      note: data.note,
      discountAmount: data.discountAmount,
      supplierId: data.supplier.id,
      items: newItems,
    };

    try {
      const response = await api.post("/purchases", payload);
      console.log("Create purchase:", response);

      toast.success("Create purchase success!");
      navigate(`/sources/purchases/${response.data.purchase.id}/`);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  return (
    <div className="max-w-[85%] mx-auto py-10 flex flex-col">
      <h1 className="font-bold flex justify-center text-2xl mb-5">
        Create Purchase
      </h1>
      <CreatePurchaseForm onSubmit={handleCreatePurchase} />
    </div>
  );
}
