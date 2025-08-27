import api from "@/api/api";
import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import { handleAxiosError } from "@/lib/utils";
import type {
  CreateInventoryType,
  InventoryDraftType,
  InventoryType,
} from "@/components/schemas/inventory.schema";
import { inventoryColumns } from "@/components/columns/inventory.column";
import { toast } from "sonner";
import PageTitle from "@/components/Title";
import { useCreateFormManager } from "@/hooks/use-custom-manager";
import InventoryModal from "@/components/modals/inventory.modal";

type InventoryProps = { isUseTitle?: boolean };

const Inventory = ({ isUseTitle = true }: InventoryProps) => {
  const [data, setData] = useState<InventoryType[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const { formManager, onAdd, onClose } = useCreateFormManager();

  const fetchData = async () => {
    try {
      const response = await api.get(
        `/inventories?page=${pageIndex}&limit=${pageSize}`
      );
      setData(response.data.inventories);
      setTotal(response.data.total);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleSubmit = async (formData: InventoryDraftType) => {
    console.log("formDataaaaaaaaaaaaa", formData);
    try {
      const payload: CreateInventoryType = {
        productId: formData.product.id,
        quantity: formData.quantity,
        note: formData.note,
        action: formData.action,
        unitPrice: formData.unitPrice,
      };

      console.log("payloadddddddddddddddd", payload);

      await api.post("/inventories", payload);
      toast.success("Add new inventory success!");
      fetchData();
      onClose();
    } catch (error) {
      handleAxiosError(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize]);

  return (
    <div className="p-4">
      {isUseTitle && <PageTitle title="Inventory"></PageTitle>}

      <DataTable
        onAdd={onAdd}
        columns={inventoryColumns()}
        data={data}
        total={total}
        pageIndex={pageIndex}
        pageSize={pageSize}
        setPageIndex={setPageIndex}
        setPageSize={setPageSize}
      />

      <InventoryModal
        formManager={formManager}
        onClose={onClose}
        handleSubmit={handleSubmit}
      ></InventoryModal>
    </div>
  );
};

export default Inventory;
