import type {
  CreatePartnerFormType,
  EditPartnerFormType,
  PartnerType,
} from "@/components/schemas/partner.schema";
import api from "@/api/api";
import { toast } from "sonner";
import { useAuth } from "@/auth/useAuth";
import PageTitle from "@/components/Title";
import { useEffect, useState } from "react";
import { handleAxiosError } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/data-table";
import PartnerModal from "@/components/modals/partner.modal";
import { useCombineFormManager } from "@/hooks/use-custom-manager";
import { useLoading } from "@/components/contexts/loading.context";
import { partnerColumns } from "@/components/columns/partner.column";
import type { PartnerTypeConst } from "@/components/constants/constants";
import { RequirePermission } from "@/components/commons/require-permission";

type PartnerProps = { isUseTitle?: boolean };

const Partner = ({ isUseTitle = true }: PartnerProps) => {
  const { setLoading } = useLoading();
  const { fetchPermissions } = useAuth();

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
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const onDetail = (partnerId: number, partnerType: PartnerTypeConst) => {
    const tmp = partnerType.toLowerCase();

    navigate(`/partners/${tmp}s/${partnerId}`);
  };

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        await fetchPermissions(["partner"]);
        await fetchData();
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [pageIndex, pageSize]);

  return (
    <div className="p-4">
      {isUseTitle && <PageTitle title="Partner"></PageTitle>}
      <RequirePermission permission="partner:read">
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
          permission={"partner:create"}
        />
      </RequirePermission>

      <PartnerModal
        formManager={formManager}
        onClose={onClose}
        handleSubmit={handleSubmit}
      ></PartnerModal>
    </div>
  );
};

export default Partner;
