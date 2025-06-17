import api from "@/api/api";
import CreateOrderForm from "@/components/forms/CreateOrderForm";
import type { CreateItemType, ItemDraftType } from "@/components/schemas/item";
import type {
  CreateOrderType,
  OrderDraftType,
} from "@/components/schemas/source";
import { handleAxiosError } from "@/lib/utils";
import { toast } from "sonner";
export default function CreateOrderPage() {
  const handleCreateOrder = async (data: OrderDraftType) => {
    const transformDraftToCreateItem = (
      draft: ItemDraftType
    ): CreateItemType => ({
      discountId: draft.discount ? draft.discount.id : undefined,
      quantity: draft.quantity,
      itemableId: draft.itemableId,
      itemableType: draft.itemableType,
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

    console.log("payload", payload);
    try {
      const response = await api.post("/orders", payload);
      console.log("Create order:", response);
      toast.success("Create order success!");
    } catch (error) {
      handleAxiosError(error);
    }
  };

  return (
    <div className="max-w-[85%] mx-auto py-10 flex flex-col">
      <h1 className="font-bold flex justify-center text-2xl mb-5">
        Create Order
      </h1>
      <CreateOrderForm onSubmit={handleCreateOrder} />
    </div>
  );
}
