import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const [showDialog, setShowDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const [data, setData] = useState<OrderType[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

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

  const handleCancel = async (id: number) => {
    try {
      await api.post(`orders/${id}/cancel`);
      fetchData();
      toast.success("Order is cancelled!");
    } catch (error) {
      handleAxiosError(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize]);

  const onCancel = (id: number) => {
    setShowDialog(true);
    setSelectedOrderId(id);
  };

  return (
    <div className="p-4">
      {isUseTitle && <PageTitle title="Order"></PageTitle>}

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

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you absolutely sure to cancel order?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              order.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleCancel(selectedOrderId)}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Order;
