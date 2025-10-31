import type {
  CreateItemType,
  ItemDraftType,
} from "@/components/schemas/item.schema";
import type {
  ConsignmentDraftType,
  CreateConsignmentType,
} from "@/components/schemas/source.schema";
import api from "@/api/api";
import { toast } from "sonner";
import { useEffect } from "react";
import { useAuth } from "@/auth/useAuth";
import PageTitle from "@/components/Title";
import { handleAxiosError } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useLoading } from "@/components/contexts/loading.context";
import { RequirePermission } from "@/components/commons/require-permission";
import CreateConsignmentForm from "@/components/forms/create-consignment.form";

type CreateConsignmentPageProps = { isUseTitle?: boolean };

export default function CreateConsignmentPage({
  isUseTitle = true,
}: CreateConsignmentPageProps) {
  const { setLoading } = useLoading();
  const { fetchPermissions } = useAuth();
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
      partnerId: data!.partner!.id,
      items: newItems,
      payerId: data?.payer?.id,
    };

    try {
      setLoading(true);
      const response = await api.post("/consignments", payload);
      toast.success("Create consignment success!");
      navigate(`/sources/consignments/${response.data.consignment.id}`);
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
        await fetchPermissions(["consignment"]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  return (
    <div className="w-[97%]  mx-auto pb-5 flex flex-col">
      {isUseTitle && <PageTitle title="Create Consignment"></PageTitle>}
      <RequirePermission permission="consignment:create">
        <CreateConsignmentForm onSubmit={handleCreateConsignment} />
      </RequirePermission>
    </div>
  );
}
