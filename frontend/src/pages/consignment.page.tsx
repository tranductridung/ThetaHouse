import type {
  PartnerTypeConst,
  ConsignmentTypeConst,
} from "@/components/constants/constants";
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
import { useLoading } from "@/components/contexts/loading.context";
import type { ConsignmentType } from "@/components/schemas/source.schema";
import type { AddPayerType } from "@/components/schemas/add-payer.schema";
import { consignmentColumns } from "@/components/columns/consigment.column";
import { RequirePermission } from "@/components/commons/require-permission";
import ConfirmCancelSourceDialog from "@/components/modals/alert/confirm-cancel-source.modal";

type ConsignmentProps = {
  partnerId?: number | undefined;
  partnerType?: PartnerTypeConst;
  isUseTitle?: boolean;
};
const Consignment = ({
  partnerId,
  partnerType,
  isUseTitle = true,
}: ConsignmentProps) => {
  const { fetchPermissions } = useAuth();
  const { setLoading } = useLoading();

  const [data, setData] = useState<ConsignmentType[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [showPayerDialog, setShowPayerDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedConsignment, setSelectedConsignment] = useState<{
    id: number;
    type: ConsignmentTypeConst;
  }>();
  const [payerId, setPayerId] = useState<number | null>(null);

  const [showConfirmHandleDialog, setShowConfirmHandleDialog] = useState(false);
  const [confirmHandleData, setConfirmHandleData] = useState<
    HandledItemListType[]
  >([]);

  const navigate = useNavigate();

  const onAdd = () => {
    navigate("/sources/consignments/create");
  };

  const onDetail = (id: number) => {
    navigate(`/sources/consignments/${id}`);
  };

  const fetchData = async () => {
    try {
      let url = `/consignments?page=${pageIndex}&limit=${pageSize}`;

      if (partnerId && partnerType) {
        // const tmp = partnerType === "Customer" ? "customers" : "suppliers";
        url = `/partners/${partnerType.toLocaleLowerCase()}s/${partnerId}/consignments?page=${pageIndex}&limit=${pageSize}`;
      }

      const response = await api.get(url);

      setData(response.data.consignments);
      setTotal(response.data.total);
    } catch (error) {
      handleAxiosError(error);
    }
  };
  const { handleExportImport } = useSourceActions(fetchData);

  const onSubmitHandle = async (id: number) => {
    try {
      setLoading(true);
      await handleExportImport(id, "Consignment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        await fetchPermissions(["consignment"]);
        await fetchData();
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [pageIndex, pageSize]);

  const handleCancel = async (id?: number) => {
    if (typeof id !== "number") return;

    try {
      setLoading(true);
      await api.post(`consignments/${id}/cancel`, { payerId });
      fetchData();
      toast.success("Consignment is cancelled!");
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setLoading(false);
    }
  };

  const onCancel = (id: number, type: ConsignmentTypeConst) => {
    if (type === "In") {
      setShowConfirmDialog(true);
    } else {
      setShowPayerDialog(true);
    }
    setSelectedConsignment({ id, type });
  };

  const onSubmitAddPayer = (formData: AddPayerType) => {
    setPayerId(formData.payer.id);
    setShowPayerDialog(false);
    setShowConfirmDialog(true);
  };
  const onHandle = async (id: number, type: ConsignmentTypeConst) => {
    setSelectedConsignment({ id, type });
    setShowConfirmHandleDialog(true);

    try {
      const response = await api.get(`consignments/${id}/check-handled`);
      setConfirmHandleData(response.data);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  return (
    <div className="p-4">
      {isUseTitle && <PageTitle title="Consignment"></PageTitle>}
      <RequirePermission permission="consignment:read" mode="disable">
        <DataTable
          onAdd={onAdd}
          columns={consignmentColumns({
            onDetail,
            onHandle,
            onCancel,
          })}
          data={data}
          total={total}
          pageIndex={pageIndex}
          pageSize={pageSize}
          setPageIndex={setPageIndex}
          setPageSize={setPageSize}
          permission={"consignment:create"}
        />
      </RequirePermission>

      <AddPayerModal
        type={"consignment"}
        onSubmitAddPayer={onSubmitAddPayer}
        showPayerDialog={showPayerDialog}
        setShowPayerDialog={setShowPayerDialog}
      ></AddPayerModal>

      <ConfirmCancelSourceDialog
        type="consignment"
        showConfirmDialog={showConfirmDialog}
        setShowConfirmDialog={setShowConfirmDialog}
        handleCancel={handleCancel}
        selectedId={selectedConsignment?.id}
      ></ConfirmCancelSourceDialog>

      <ConfirmExportImportSourceDialog
        type={"consignment"}
        handleType={selectedConsignment?.type === "In" ? "import" : "export"}
        showConfirmDialog={showConfirmHandleDialog}
        setShowConfirmDialog={setShowConfirmHandleDialog}
        handleConfirm={() => onSubmitHandle(selectedConsignment?.id)}
        data={confirmHandleData}
      ></ConfirmExportImportSourceDialog>
    </div>
  );
};

export default Consignment;
