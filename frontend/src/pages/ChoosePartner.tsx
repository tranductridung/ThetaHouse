import { choosePartnerColumns } from "@/components/columns/choose-partner.column";
import type { TypeOfConsignment } from "@/components/constants/constants";
import { DataTable } from "@/components/data-table";
import type { PartnerType } from "@/components/schemas/partner.schema";
import api from "@/api/api";
import { handleAxiosError } from "@/lib/utils";
import { useEffect, useState } from "react";

type ChoosePartnerProps = {
  type: TypeOfConsignment;
  handleChoosePartner: (partner: PartnerType) => void;
};

const ChoosePartner = ({ type, handleChoosePartner }: ChoosePartnerProps) => {
  const [data, setData] = useState<PartnerType[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchData = async () => {
    try {
      const response =
        type === "In"
          ? await api.get(
              `/partners/supplier?page=${pageIndex}&limit=${pageSize}`
            )
          : await api.get(
              `/partners/customer?page=${pageIndex}&limit=${pageSize}`
            );
      setData(response.data.partners);
      setTotal(response.data.total);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize]);

  return (
    <div>
      <DataTable
        onAdd={undefined}
        columns={choosePartnerColumns({
          handleChoosePartner,
        })}
        data={data}
        total={total}
        pageIndex={pageIndex}
        pageSize={pageSize}
        setPageIndex={setPageIndex}
        setPageSize={setPageSize}
      />
    </div>
  );
};
export default ChoosePartner;
