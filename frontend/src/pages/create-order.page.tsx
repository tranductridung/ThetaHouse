import type {
  CreateItemType,
  ItemDraftType,
} from "@/components/schemas/item.schema";
import type {
  CreateOrderType,
  OrderDraftType,
} from "@/components/schemas/source.schema";
import api from "@/api/api";
import { toast } from "sonner";
import { useEffect } from "react";
import { useAuth } from "@/auth/useAuth";
import PageTitle from "@/components/Title";
import { handleAxiosError } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import CreateOrderForm from "@/components/forms/create-order.form";
import { useLoading } from "@/components/contexts/loading.context";
import { RequirePermission } from "@/components/commons/require-permission";

type CreateOrderPageProps = { isUseTitle?: boolean };

export default function CreateOrderPage({
  isUseTitle = true,
}: CreateOrderPageProps) {
  const { setLoading } = useLoading();
  const { fetchPermissions } = useAuth();
  const navigate = useNavigate();

  const handleCreateOrder = async (data: OrderDraftType) => {
    const transformDraftToCreateItem = (
      draft: ItemDraftType
    ): CreateItemType => ({
      discountId: draft.discount ? draft.discount.id : undefined,
      quantity: draft.quantity,
      itemableId: draft.itemableId,
      itemableType: draft.itemableType,
      unitPrice: draft.unitPrice,
    });

    const newItems: CreateItemType[] = data.items.map(
      transformDraftToCreateItem
    );

    const payload: CreateOrderType = {
      note: data.note,
      discountId: data?.discount?.id,
      customerId: data.customer.id,
      items: newItems,
    };

    try {
      setLoading(true);
      const response = await api.post("/orders", payload);
      toast.success("Create order success!");
      navigate(`/sources/orders/${response.data.order.id}/`);
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
        await fetchPermissions(["order"]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  return (
    <div className="w-[97%]  mx-auto pb-5 flex flex-col">
      {isUseTitle && <PageTitle title="Create Order"></PageTitle>}
      <RequirePermission permission="order:create">
        <CreateOrderForm onSubmit={handleCreateOrder} />
      </RequirePermission>
    </div>
  );
}
