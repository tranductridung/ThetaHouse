import { useEffect, useState } from "react";
import type { ConsignmentType } from "@/components/schemas/source.schema";
import api from "@/api/api";
import { DataTable } from "@/components/data-table";
import { useNavigate } from "react-router-dom";
import { consignmentColumns } from "@/components/columns/consigment.column";
import { useSourceActions } from "@/hooks/useSourceAction";
import type {
  TypeOfConsignment,
  TypeOfPartner,
} from "@/components/constants/constants";
import PageTitle from "@/components/Title";
import { toast } from "sonner";
import { handleAxiosError } from "@/lib/utils";
import type { AddPayerType } from "@/components/schemas/add-payer.schema";
import AddPayerModal from "@/components/modals/add-payer.modal";
import ConfirmDialog from "@/components/alert-dialogs/confirm.dialog";

type ConsignmentProps = {
  partnerId?: number | undefined;
  partnerType?: TypeOfPartner;
  isUseTitle?: boolean;
};
const Consignment = ({
  partnerId,
  partnerType,
  isUseTitle = true,
}: ConsignmentProps) => {
  const [data, setData] = useState<ConsignmentType[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [showPayerDialog, setShowPayerDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedConsignmentId, setSelectedConsignmentId] = useState<
    number | null
  >(null);
  const [payerId, setPayerId] = useState<number | null>(null);

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
        const tmp = partnerType === "Customer" ? "customers" : "suppliers";
        url = `/partners/${tmp}/${partnerId}/consignments?page=${pageIndex}&limit=${pageSize}`;
      }

      const response = await api.get(url);

      setData(response.data.consignments);
      setTotal(response.data.total);
    } catch (error) {
      handleAxiosError(error);
    }
  };
  const { handleExportImport } = useSourceActions(fetchData);

  const onHandle = async (id: number) => {
    handleExportImport(id, "Consignment");
  };

  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize]);

  const handleCancel = async (id: number) => {
    try {
      await api.post(`consignments/${id}/cancel`, { payerId });
      fetchData();
      toast.success("Consignment is cancelled!");
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const onCancel = (id: number, type: TypeOfConsignment) => {
    if (type === "In") {
      setShowConfirmDialog(true);
      setSelectedConsignmentId(id);
    } else {
      setSelectedConsignmentId(id);
      setShowPayerDialog(true);
    }
  };

  const onSubmitAddPayer = (formData: AddPayerType) => {
    setPayerId(formData.payer.id);
    setShowPayerDialog(false);
    setShowConfirmDialog(true);
  };

  return (
    <div className="p-4">
      {isUseTitle && <PageTitle title="Consignment"></PageTitle>}

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
      />

      <AddPayerModal
        type={"consignment"}
        onSubmitAddPayer={onSubmitAddPayer}
        showPayerDialog={showPayerDialog}
        setShowPayerDialog={setShowPayerDialog}
      ></AddPayerModal>

      <ConfirmDialog
        type="consignment"
        showConfirmDialog={showConfirmDialog}
        setShowConfirmDialog={setShowConfirmDialog}
        handleCancel={handleCancel}
        selectedId={selectedConsignmentId}
      ></ConfirmDialog>
    </div>
  );
};

export default Consignment;
