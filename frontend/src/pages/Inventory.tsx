import api from "@/api/api";
import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import { handleAxiosError } from "@/lib/utils";
import type {
  CreateInventoryType,
  InventoryDraftType,
  InventoryType,
} from "@/components/schemas/inventory";
import { inventoryColumns } from "@/components/columns/inventory";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import InventoryForm from "@/components/forms/InventoryForm";

export type FormManagerType = {
  isShow: boolean;
  data: InventoryType | null;
};

const Inventory = () => {
  const [data, setData] = useState<InventoryType[]>([]);
  const [formManager, setFormManager] = useState<FormManagerType>({
    isShow: false,
    data: null,
  });
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const handleSubmit = async (formData: InventoryDraftType) => {
    try {
      console.log("formData", formData);
      const payload: CreateInventoryType = {
        productId: formData.product.id,
        quantity: formData.quantity,
        note: formData.note,
        action: formData.action,
      };
      const response = await api.post("/inventories", payload);
      console.log(response.data);
      setData((prev) => [...prev, response.data.inventory]);

      setFormManager({
        isShow: false,
        data: null,
      });
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const onAdd = () => {
    setFormManager({
      isShow: true,
      data: null,
    });
  };

  useEffect(() => {
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
    fetchData();
  }, [pageIndex, pageSize]);

  return (
    <div className="p-4">
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

      <Dialog
        open={formManager.isShow}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setFormManager({
              isShow: false,
              data: null,
            });
          }
        }}
      >
        <DialogContent>
          <DialogTitle></DialogTitle>
          <InventoryForm onSubmit={handleSubmit} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
