import api from "@/api/api";
import { useAuth } from "@/auth/useAuth";
import PageTitle from "@/components/Title";
import { useEffect, useState } from "react";
import { handleAxiosError } from "@/lib/utils";
import { DataTable } from "@/components/data-table";
import { useLoading } from "@/components/contexts/loading.context";
import { paymentColumns } from "@/components/columns/payment.column";
import type { PaymentType } from "@/components/schemas/payment.schema";
import { RequirePermission } from "@/components/commons/require-permission";

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
        await fetchPermissions(["payment"]);
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
      <RequirePermission permission="payment:read">
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
      </RequirePermission>
    </div>
  );
};

export default Payment;
