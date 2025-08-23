import api from "@/api/api";
import CreatePurchaseForm from "@/components/forms/create-purchase.form";
import type {
  CreateItemType,
  ItemDraftType,
} from "@/components/schemas/item.schema";
import type {
  CreatePurchaseType,
  PurchaseDraftType,
} from "@/components/schemas/source.schema";
import PageTitle from "@/components/Title";
import { handleAxiosError } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type CreatePurchaseProps = { isUseTitle?: boolean };

export default function CreatePurchasePage({
  isUseTitle = true,
}: CreatePurchaseProps) {
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
      payerId: data.payer.id,
      items: newItems,
    };
    try {
      const response = await api.post("/purchases", payload);
      toast.success("Create purchase success!");
      navigate(`/sources/purchases/${response.data.purchase.id}/`);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  return (
    <div className="w-[97%]  mx-auto pb-5 flex flex-col">
      {isUseTitle && <PageTitle title="Create Purchase"></PageTitle>}

      <CreatePurchaseForm onSubmit={handleCreatePurchase} />
    </div>
  );
}
