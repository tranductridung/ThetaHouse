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

  const handleSubmit = async (
    formData: CreatePartnerFormType | EditPartnerFormType
  ) => {
    try {
      if (formManager.type === "add") {
        const response = await api.post("/partners", formData);
        setData((prev) => [...prev, response.data.partner]);
        toast.success(`Create partner success!`);
      } else if (formManager.type === "edit" && formManager.data?.id) {
        const response = await api.patch(
          `/partners/${formManager.data.id}`,
          formData
        );
        setData((prev) =>
          prev.map((partner) =>
            partner.id === formManager.data?.id
              ? response.data.partner
              : partner
          )
        );
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

  useEffect(() => {
    const fetchData = async () => {
      const response = await api.get("/partners");
      setData(response.data.partners);
    };
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <DataTable
        onAdd={onAdd}
        columns={partnerColumns({
          onEdit,
        })}
        data={data}
      />

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
