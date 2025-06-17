import api from "@/api/api";
import { choosePartnerColumns } from "@/components/columns/choose-partner";
import { DataTable } from "@/components/data-table";
import { handleAxiosError } from "@/lib/utils";
import { useEffect, useState } from "react";
import type { TypeOfPartner } from "./constants/constants";
import type { PartnerType } from "./schemas/partner";
type ChooseCustomerSupplierProps = {
  type: (typeof TypeOfPartner)[number];
  handleChoosePartner: (partner: PartnerType) => void;
};

const ChooseCustomerSupplier = ({
  type,
  handleChoosePartner,
}: ChooseCustomerSupplierProps) => {
  const [data, setData] = useState<PartnerType[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response =
          type === "Customer"
            ? await api.get(
                `/partners/customer?page=${pageIndex}&limit=${pageSize}`
              )
            : await api.get(
                `/partners/supplier?page=${pageIndex}&limit=${pageSize}`
              );

        setData(response.data.partners);
        setTotal(response.data.total);
      } catch (error) {
        handleAxiosError(error);
      }
    };

    fetchData();
  }, [pageIndex, pageSize]);
  console.log(data);
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
export default ChooseCustomerSupplier;
