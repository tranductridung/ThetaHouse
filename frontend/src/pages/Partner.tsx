import api from "@/api/api";
import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import type {
  CreatePartnerFormType,
  EditPartnerFormType,
  PartnerType,
} from "@/components/schemas/partner";
import { partnerColumns } from "@/components/columns/partner-column";
import PartnerForm from "@/components/forms/PartnerForm";
import { toast } from "sonner";
import { handleAxiosError } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import type { TypeOfPartner } from "@/components/constants/constants";

export type FormManagerType = {
  isShow: boolean;
  type: "add" | "edit";
  data: PartnerType | null;
};

const Partner = () => {
  const [data, setData] = useState<PartnerType[]>([]);
  const [formManager, setFormManager] = useState<FormManagerType>({
    isShow: false,
    type: "add",
    data: null,
  });
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

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
        fetchData();
        toast.success(`Create partner success!`);
      } else if (formManager.type === "edit" && formManager.data?.id) {
        await api.patch(`/partners/${formManager.data.id}`, formData);

        fetchData();
        toast.success(`Edit partner success!`);
      }

      setFormManager({
        isShow: false,
        type: "add",
        data: null,
      });
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const onAdd = () => {
    setFormManager({
      isShow: true,
      type: "add",
      data: null,
    });
  };

  const onEdit = (partner: PartnerType) => {
    setFormManager({
      isShow: true,
      type: "edit",
      data: partner,
    });
  };

  const onDetail = (partnerId: number, partnerType: TypeOfPartner) => {
    const tmp = partnerType.toLowerCase();

    navigate(`/partners/${tmp}s/${partnerId}`);
  };

  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize]);

  return (
    <div className="p-4">
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

      {/* Create partner */}
      <Dialog
        open={formManager.isShow}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setFormManager({
              isShow: false,
              type: "add",
              data: null,
            });
          }
        }}
      >
        <DialogContent>
          <DialogTitle></DialogTitle>
          <PartnerForm
            partnerData={formManager.data}
            onSubmit={handleSubmit}
            type={formManager.type}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Partner;
