import { useEffect, useState } from "react";
import type { PurchaseType } from "@/components/schemas/source.schema";
import api from "@/api/api";
import { DataTable } from "@/components/data-table";
import { useNavigate } from "react-router-dom";
import { purchaseColumns } from "@/components/columns/purchase.column";
import { handleAxiosError } from "@/lib/utils";
import { useSourceActions } from "@/hooks/useSourceAction";
import PageTitle from "@/components/Title";
import { toast } from "sonner";
import ConfirmDialog from "@/components/alert-dialogs/confirm.dialog";
import { useLoading } from "@/components/contexts/loading.context";
import { useAuth } from "@/auth/useAuth";
import { RequirePermission } from "@/components/commons/require-permission";

type PurchaseProps = { supplierId?: number; isUseTitle?: boolean };
const Purchase = ({ supplierId, isUseTitle = true }: PurchaseProps) => {
  const { setLoading } = useLoading();
  const { fetchPermissions } = useAuth();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<number>();

  const [data, setData] = useState<PurchaseType[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const url = supplierId
        ? `/partners/suppliers/${supplierId}/purchases?page=${pageIndex}&limit=${pageSize}`
        : `/purchases/all?page=${pageIndex}&limit=${pageSize}`;

      const response = await api.get(url);

      setData(response.data.purchases);
      setTotal(response.data.total);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const { handleExportImport } = useSourceActions(fetchData);

  const onImport = async (id: number) => {
    try {
      setLoading(true);
      await handleExportImport(id, "Purchase");
    } finally {
      setLoading(false);
    }
  };

  const onAdd = () => {
    navigate("/sources/purchases/create");
  };

  const onDetail = (id: number) => {
    navigate(`/sources/purchases/${id}`);
  };

  const handleCancel = async (id?: number) => {
    if (typeof id !== "number") return;

    try {
      setLoading(true);
      await api.post(`purchases/${id}/cancel`);
      fetchData();
      toast.success("Purchase is cancelled!");
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setLoading(false);
    }
  };

  const onCancel = (id: number) => {
    setShowConfirmDialog(true);
    setSelectedPurchaseId(id);
  };

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        await fetchPermissions(["purchase"]);
        await fetchData();
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [pageIndex, pageSize]);

  return (
    <div className="p-4">
      {isUseTitle && <PageTitle title="Purchase"></PageTitle>}
      <RequirePermission permission="purchase:read">
        <DataTable
          onAdd={onAdd}
          columns={purchaseColumns({
            onDetail,
            onImport,
            onCancel,
          })}
          data={data}
          total={total}
          pageIndex={pageIndex}
          pageSize={pageSize}
          setPageIndex={setPageIndex}
          setPageSize={setPageSize}
          permission={"purchase:create"}
        />
      </RequirePermission>

      <ConfirmDialog
        type="purchase"
        showConfirmDialog={showConfirmDialog}
        setShowConfirmDialog={setShowConfirmDialog}
        handleCancel={handleCancel}
        selectedId={selectedPurchaseId}
      ></ConfirmDialog>
    </div>
  );
};

export default Purchase;
