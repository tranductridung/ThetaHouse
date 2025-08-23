import api from "@/api/api";
import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import type {
  CreatePartnerFormType,
  EditPartnerFormType,
  PartnerType,
} from "@/components/schemas/partner.schema";
import { partnerColumns } from "@/components/columns/partner.column";
import { toast } from "sonner";
import { handleAxiosError } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import type { PartnerTypeConst } from "@/components/constants/constants";
import PageTitle from "@/components/Title";
import PartnerModal from "@/components/modals/partner.modal";
import { useCombineFormManager } from "@/hooks/use-custom-manager";

type PartnerProps = { isUseTitle?: boolean };

const Partner = ({ isUseTitle = true }: PartnerProps) => {
  const [data, setData] = useState<PartnerType[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const { formManager, onAdd, onEdit, onClose } =
    useCombineFormManager<PartnerType>();

  const fetchData = async () => {
    try {
      const response = await api.get(
        `/partners?page=${pageIndex}&limit=${pageSize}`
      );
      setData(response.data.partners);
      setTotal(response.data.total);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleSubmit = async (
    formData: CreatePartnerFormType | EditPartnerFormType
  ) => {
    try {
      if (formManager.type === "add") {
        await api.post("/partners", formData);
        toast.success(`Create partner success!`);
      } else if (formManager.type === "edit" && formManager.data?.id) {
        await api.patch(`/partners/${formManager.data.id}`, formData);
        toast.success(`Edit partner success!`);
      }

      fetchData();
      onClose();
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const onDetail = (partnerId: number, partnerType: PartnerTypeConst) => {
    const tmp = partnerType.toLowerCase();

    navigate(`/partners/${tmp}s/${partnerId}`);
  };

  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize]);

  return (
    <div className="p-4">
      {isUseTitle && <PageTitle title="Partner"></PageTitle>}
      <DataTable
        onAdd={onAdd}
        columns={partnerColumns({
          onEdit,
          onDetail,
        })}
        data={data}
        total={total}
        pageIndex={pageIndex}
        pageSize={pageSize}
        setPageIndex={setPageIndex}
        setPageSize={setPageSize}
      />

      <PartnerModal
        formManager={formManager}
        onClose={onClose}
        handleSubmit={handleSubmit}
      ></PartnerModal>
    </div>
  );
};

export default Partner;
