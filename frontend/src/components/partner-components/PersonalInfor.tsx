import { useEffect, useState } from "react";
import PartnerForm from "../forms/partner.form";
import type {
  PartnerType,
  EditPartnerFormType,
} from "../schemas/partner.schema";
import api from "@/api/api";
import { handleAxiosError } from "@/lib/utils";
import { toast } from "sonner";

type PersonalInforProps = {
  partnerId: number;
};

const PersonalInfor = ({ partnerId }: PersonalInforProps) => {
  const [data, setData] = useState<PartnerType | null>(null);

  const fetchData = async () => {
    try {
      const response = await api.get(`partners/${partnerId}`);
      setData(response.data.partner);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleSubmit = async (formData: EditPartnerFormType) => {
    try {
      await api.patch(`/partners/${data?.id}`, formData);

      fetchData();
      toast.success(`Update partner information success!`);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <div>
        <PartnerForm
          partnerData={data}
          onSubmit={handleSubmit}
          type={"edit"}
        ></PartnerForm>
      </div>
    </>
  );
};

export default PersonalInfor;
