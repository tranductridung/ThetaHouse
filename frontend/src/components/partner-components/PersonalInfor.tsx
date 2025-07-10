import { useEffect, useState } from "react";
import PartnerForm from "../forms/PartnerForm";
import type { PartnerType, EditPartnerFormType } from "../schemas/partner";
import api from "@/api/api";
import { handleAxiosError } from "@/lib/utils";
import { toast } from "sonner";
import type { TypeOfPartner } from "../constants/constants";

type PersonalInforProps = {
  partnerId: number;
  partnerType: TypeOfPartner;
};

const PersonalInfor = ({ partnerId, partnerType }: PersonalInforProps) => {
  const [data, setData] = useState<PartnerType | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetchData = async () => {
    try {
      const response = await api.get(`partners/${partnerId}`);
      if (response.data.partner.type !== partnerType) setNotFound(true);

      setData(response.data.partner);
    } catch (error) {
      setNotFound(true);
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

  if (notFound)
    return (
      <div className="flex justify-center items-center w-full h-full">
        <h1 className="font-semibold text-2xl">
          {partnerType.toUpperCase()} NOT FOUND!
        </h1>
      </div>
    );

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
