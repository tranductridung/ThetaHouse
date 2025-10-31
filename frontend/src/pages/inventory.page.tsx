import type {
  CreateInventoryType,
  InventoryDraftType,
  InventoryType,
} from "@/components/schemas/inventory.schema";
import api from "@/api/api";
import { toast } from "sonner";
import { useAuth } from "@/auth/useAuth";
import PageTitle from "@/components/Title";
import { useEffect, useState } from "react";
import { handleAxiosError } from "@/lib/utils";
import { DataTable } from "@/components/data-table";
import InventoryModal from "@/components/modals/inventory.modal";
import { useCreateFormManager } from "@/hooks/use-custom-manager";
import { useLoading } from "@/components/contexts/loading.context";
import { inventoryColumns } from "@/components/columns/inventory.column";
import { RequirePermission } from "@/components/commons/require-permission";

type InventoryProps = { isUseTitle?: boolean };

const Inventory = ({ isUseTitle = true }: InventoryProps) => {
  const { setLoading } = useLoading();
  const { fetchPermissions } = useAuth();

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
    try {
      setLoading(true);
      const payload: CreateInventoryType = {
        productId: formData.product.id,
        quantity: formData.quantity,
        note: formData.note,
        action: formData.action,
        unitPrice: formData.unitPrice,
      };

      await api.post("/inventories", payload);
      toast.success("Add new inventory success!");
      fetchData();
      onClose();
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
        await fetchPermissions(["inventory"]);
        await fetchData();
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [pageIndex, pageSize]);

  return (
    <div className="p-4">
      {isUseTitle && <PageTitle title="Inventory"></PageTitle>}
      <RequirePermission permission="inventory:read">
        <DataTable
          onAdd={onAdd}
          columns={inventoryColumns()}
          data={data}
          total={total}
          pageIndex={pageIndex}
          pageSize={pageSize}
          setPageIndex={setPageIndex}
          setPageSize={setPageSize}
          permission={"inventory:create"}
        />
      </RequirePermission>
      <InventoryModal
        formManager={formManager}
        onClose={onClose}
        handleSubmit={handleSubmit}
      ></InventoryModal>
    </div>
  );
};

export default Inventory;
