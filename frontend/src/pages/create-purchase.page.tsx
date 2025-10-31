import type {
  CreateItemType,
  ItemDraftType,
} from "@/components/schemas/item.schema";
import type {
  CreatePurchaseType,
  PurchaseDraftType,
} from "@/components/schemas/source.schema";
import api from "@/api/api";
import { toast } from "sonner";
import { useEffect } from "react";
import { useAuth } from "@/auth/useAuth";
import PageTitle from "@/components/Title";
import { handleAxiosError } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useLoading } from "@/components/contexts/loading.context";
import CreatePurchaseForm from "@/components/forms/create-purchase.form";
import { RequirePermission } from "@/components/commons/require-permission";

type CreatePurchaseProps = { isUseTitle?: boolean };

export default function CreatePurchasePage({
  isUseTitle = true,
}: CreatePurchaseProps) {
  const { setLoading } = useLoading();
  const { fetchPermissions } = useAuth();
  const navigate = useNavigate();

  const handleCreatePurchase = async (data: PurchaseDraftType) => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        await fetchPermissions(["purchase"]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  return (
    <div className="w-[97%]  mx-auto pb-5 flex flex-col">
      {isUseTitle && <PageTitle title="Create Purchase"></PageTitle>}
      <RequirePermission permission="purchase:create">
        <CreatePurchaseForm onSubmit={handleCreatePurchase} />
      </RequirePermission>
    </div>
  );
}
