import ConfirmExportImportSourceDialog, {
  type HandledItemListType,
} from "@/components/modals/alert/confirm-export-import-source.modal";
import api from "@/api/api";
import { toast } from "sonner";
import { useAuth } from "@/auth/useAuth";
import PageTitle from "@/components/Title";
import { useEffect, useState } from "react";
import { handleAxiosError } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/data-table";
import { useSourceActions } from "@/hooks/useSourceAction";
import AddPayerModal from "@/components/modals/add-payer.modal";
import { orderColumns } from "@/components/columns/order.column";
import { useLoading } from "@/components/contexts/loading.context";
import type { OrderType } from "@/components/schemas/source.schema";
import type { AddPayerType } from "@/components/schemas/add-payer.schema";
import { RequirePermission } from "@/components/commons/require-permission";
import ConfirmCancelSourceDialog from "@/components/modals/alert/confirm-cancel-source.modal";

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
  const { setLoading } = useLoading();
  const { fetchPermissions } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState<OrderType[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [showPayerDialog, setShowPayerDialog] = useState(false);
  const [showConfirmCancelDialog, setShowConfirmCancelDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number>();
  const [payerId, setPayerId] = useState<number | null>(null);

  const [showConfirmExportDialog, setShowConfirmExportDialog] = useState(false);
  const [confirmExportData, setConfirmExportData] = useState<
    HandledItemListType[]
  >([]);

  const fetchData = async () => {
    try {
      const url = customerId
        ? `/partners/customers/${customerId}/orders?page=${pageIndex}&limit=${pageSize}`
        : `/orders/all?page=${pageIndex}&limit=${pageSize}`;
      const response = await api.get(url);
      setData(response.data.orders);
      setTotal(response.data.total);
    } catch (error) {
      setLoading(false);
      handleAxiosError(error);
    }
  };

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        await fetchPermissions(["order"]);
        await fetchData();
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [pageIndex, pageSize]);

  const onAdd = () => {
    navigate("/sources/orders/create");
  };

  const onDetail = (id: number) => {
    navigate(`/sources/orders/${id}`);
  };

  const { handleExportImport } = useSourceActions(fetchData);

  const onSubmitExport = async (id: number) => {
    try {
      setLoading(true);
      await handleExportImport(id, "Order");
      await fetchData();
    } finally {
      setLoading(false);
    }
  };

  const onCancel = (id: number) => {
    setSelectedOrderId(id);
    setShowPayerDialog(true);
  };

  const handleCancel = async (id?: number) => {
    if (typeof id !== "number" || !payerId) return;

    try {
      setLoading(true);
      await api.post(`orders/${id}/cancel`, { payerId });
      fetchData();
      toast.success("Order is cancelled!");
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setShowConfirmCancelDialog(false);
      setSelectedOrderId(undefined);
      setPayerId(null);
      setLoading(false);
    }
  };

  const onSubmitAddPayer = (formData: AddPayerType) => {
    setPayerId(formData.payer.id);
    setShowPayerDialog(false);
    setShowConfirmCancelDialog(true);
  };

  const onExport = async (id: number) => {
    setSelectedOrderId(id);
    setShowConfirmExportDialog(true);

    try {
      const response = await api.get(`orders/${id}/items/not-exported`);
      setConfirmExportData(response.data);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  return (
    <div className="p-4">
      {isUseTitle && <PageTitle title="Order" />}
      <RequirePermission permission="order:read">
        <DataTable
          onAdd={onAdd}
          columns={orderColumns({
            onDetail,
            onCancel,
            onExport,
          })}
          data={data}
          total={total}
          pageIndex={pageIndex}
          pageSize={pageSize}
          setPageIndex={setPageIndex}
          setPageSize={setPageSize}
          permission={"order:create"}
        />
      </RequirePermission>

      <AddPayerModal
        type={"order"}
        onSubmitAddPayer={onSubmitAddPayer}
        showPayerDialog={showPayerDialog}
        setShowPayerDialog={setShowPayerDialog}
      ></AddPayerModal>

      <ConfirmCancelSourceDialog
        type={"order"}
        showConfirmDialog={showConfirmCancelDialog}
        setShowConfirmDialog={setShowConfirmCancelDialog}
        handleCancel={handleCancel}
        selectedId={selectedOrderId}
      ></ConfirmCancelSourceDialog>

      <ConfirmExportImportSourceDialog
        handleType={"import"}
        type={"order"}
        showConfirmDialog={showConfirmExportDialog}
        setShowConfirmDialog={setShowConfirmExportDialog}
        handleConfirm={() => onSubmitExport(selectedOrderId!)}
        data={confirmExportData}
      ></ConfirmExportImportSourceDialog>
    </div>
  );
};

export default Order;
