import { useEffect, useState } from "react";
import type { OrderType } from "@/components/schemas/source.schema";
import { orderColumns } from "@/components/columns/order.column";
import api from "@/api/api";
import { DataTable } from "@/components/data-table";
import { useNavigate } from "react-router-dom";
import { handleAxiosError } from "@/lib/utils";
import { toast } from "sonner";
import { useSourceActions } from "@/hooks/useSourceAction";
import PageTitle from "@/components/Title";
import type { AddPayerType } from "@/components/schemas/add-payer.schema";
import AddPayerModal from "@/components/modals/add-payer.modal";
import ConfirmDialog from "@/components/alert-dialogs/confirm.dialog";

export type FormManagerType = {
  isShow: boolean;
  type: "add" | "edit";
  data: OrderType | null;
};

type OrderProps = {
  customerId?: number | undefined;
  isUseTitle?: boolean;
};

const Order = ({ customerId, isUseTitle = true }: OrderProps) => {
  const [data, setData] = useState<OrderType[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const [showPayerDialog, setShowPayerDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [payerId, setPayerId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const url = customerId
        ? `/partners/customers/${customerId}/orders?page=${pageIndex}&limit=${pageSize}`
        : `/orders/all?page=${pageIndex}&limit=${pageSize}`;
      const response = await api.get(url);
      setData(response.data.orders);
      setTotal(response.data.total);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize]);

  const onAdd = () => {
    navigate("/sources/orders/create");
  };

  const onDetail = (id: number) => {
    navigate(`/sources/orders/${id}`);
  };

  const { handleExportImport } = useSourceActions(fetchData);

  const handleExport = async (id: number) => {
    handleExportImport(id, "Order");
  };

  const onCancel = (id: number) => {
    setSelectedOrderId(id);
    setShowPayerDialog(true);
  };

  const handleCancel = async (id: number | null) => {
    if (!id || !payerId) return;

    try {
      await api.post(`orders/${id}/cancel`, { payerId });
      fetchData();
      toast.success("Order is cancelled!");
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setShowConfirmDialog(false);
      setSelectedOrderId(null);
      setPayerId(null);
    }
  };

  const onSubmitAddPayer = (formData: AddPayerType) => {
    setPayerId(formData.payer.id);
    setShowPayerDialog(false);
    setShowConfirmDialog(true);
  };

  return (
    <div className="p-4">
      {isUseTitle && <PageTitle title="Order" />}

      <DataTable
        onAdd={onAdd}
        columns={orderColumns({
          onDetail,
          handleExport,
          onCancel,
        })}
        data={data}
        total={total}
        pageIndex={pageIndex}
        pageSize={pageSize}
        setPageIndex={setPageIndex}
        setPageSize={setPageSize}
      />

      <AddPayerModal
        type={"order"}
        onSubmitAddPayer={onSubmitAddPayer}
        showPayerDialog={showPayerDialog}
        setShowPayerDialog={setShowPayerDialog}
      ></AddPayerModal>

      <ConfirmDialog
        type={"order"}
        showConfirmDialog={showConfirmDialog}
        setShowConfirmDialog={setShowConfirmDialog}
        handleCancel={handleCancel}
        selectedId={selectedOrderId}
      ></ConfirmDialog>
    </div>
  );
};

export default Order;
