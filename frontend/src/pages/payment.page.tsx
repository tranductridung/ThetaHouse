import api from "@/api/api";
import { DataTable } from "@/components/data-table";
import type { PaymentType } from "@/components/schemas/payment.schema";
import { paymentColumns } from "@/components/columns/payment.column";
import { useEffect, useState } from "react";
import { handleAxiosError } from "@/lib/utils";
import PageTitle from "@/components/Title";
import { useLoading } from "@/components/contexts/loading.context";
import { useAuth } from "@/auth/useAuth";

type PaymentProps = {
  isUseTitle?: boolean;
};

const Payment = ({ isUseTitle = true }: PaymentProps) => {
  const { setLoading } = useLoading();
  const { fetchPermissions } = useAuth();

  const [data, setData] = useState<PaymentType[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchData = async () => {
    try {
      const response = await api.get(
        `/payments?page=${pageIndex}&limit=${pageSize}`
      );
      setData(response.data.payments);
      setTotal(response.data.total);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        await fetchPermissions("payment");
        await fetchData();
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [pageIndex, pageSize]);

  return (
    <div className="p-4">
      {isUseTitle && <PageTitle title="Payment"></PageTitle>}

      <DataTable
        columns={paymentColumns}
        data={data}
        onAdd={undefined}
        total={total}
        pageIndex={pageIndex}
        pageSize={pageSize}
        setPageIndex={setPageIndex}
        setPageSize={setPageSize}
      />
    </div>
  );
};

export default Payment;
