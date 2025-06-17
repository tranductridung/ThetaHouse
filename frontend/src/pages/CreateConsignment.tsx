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
import { useEffect, useState } from "react";
import { toast } from "sonner";
export default function CreateConsignmentPage() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [customers, setCustomers] = useState<PartnerType[]>([]);
  const [suppliers, setSuppliers] = useState<PartnerType[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const productResponse = await api.get("/products");
      setProducts(productResponse.data.products);

      const customerResponse = await api.get("partners/customer");
      setCustomers(customerResponse.data.customers);

      const supplierResponse = await api.get("partners/supplier");
      setSuppliers(supplierResponse.data.suppliers);
    };

    fetchData();
  }, []);

  const handleCreateConsignment = async (data: ConsignmentDraftType) => {
    const transformDraftToCreateItem = (
      draft: ItemDraftType
    ): CreateItemType => ({
      quantity: draft.quantity,
      itemableId: draft.itemableId,
      itemableType: draft.itemableType,
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

    console.log("payload", payload);
    try {
      const response = await api.post("/consignments", payload);
      console.log("Create consignment:", response);
      toast.success("Create consignment success!");
    } catch (error) {
      handleAxiosError(error);
    }
  };

  return (
    <div className="max-w-[85%] mx-auto py-10 flex flex-col">
      <h1 className="font-bold flex justify-center text-2xl mb-5">
        Create Consignment
      </h1>
      <CreateConsignmentForm onSubmit={handleCreateConsignment} />
    </div>
  );
}
