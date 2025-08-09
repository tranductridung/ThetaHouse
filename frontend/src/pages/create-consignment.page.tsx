import api from "@/api/api";
import CreateConsignmentForm from "@/components/forms/create-consignment.form";
import type {
  CreateItemType,
  ItemDraftType,
} from "@/components/schemas/item.schema";
import type {
  ConsignmentDraftType,
  CreateConsignmentType,
} from "@/components/schemas/source.schema";
import PageTitle from "@/components/Title";

import { handleAxiosError } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type CreateConsignmentPageProps = { isUseTitle?: boolean };

export default function CreateConsignmentPage({
  isUseTitle = true,
}: CreateConsignmentPageProps) {
  const navigate = useNavigate();

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
      partnerId: data?.partner?.id,
      items: newItems,
      payerId: data?.payer?.id,
    };

    try {
      const response = await api.post("/consignments", payload);
      toast.success("Create consignment success!");
      navigate(`/sources/consignments/${response.data.consignment.id}`);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  return (
    <div className="max-w-[95%] mx-auto pb-10 flex flex-col">
      {isUseTitle && <PageTitle title="Create Consignment"></PageTitle>}

      <CreateConsignmentForm onSubmit={handleCreateConsignment} />
    </div>
  );
}
