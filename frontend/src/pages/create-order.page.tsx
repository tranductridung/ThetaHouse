import api from "@/api/api";
import CreateOrderForm from "@/components/forms/create-order.form";
import type {
  CreateItemType,
  ItemDraftType,
} from "@/components/schemas/item.schema";
import type {
  CreateOrderType,
  OrderDraftType,
} from "@/components/schemas/source.schema";
import PageTitle from "@/components/Title";
import { handleAxiosError } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type CreateOrderPageProps = { isUseTitle?: boolean };

export default function CreateOrderPage({
  isUseTitle = true,
}: CreateOrderPageProps) {
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
      discountId: data.discount?.id,
      customerId: data.customer.id,
      items: newItems,
    };

    try {
      const response = await api.post("/orders", payload);
      console.log("Create order:", response);
      toast.success("Create order success!");
      navigate(`/sources/orders/${response.data.order.id}/`);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  return (
    <div className="max-w-[95%] mx-auto pb-10 flex flex-col">
      {isUseTitle && <PageTitle title="Create Order"></PageTitle>}

      <CreateOrderForm onSubmit={handleCreateOrder} />
    </div>
  );
}
