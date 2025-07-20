import api from "@/api/api";
import { DataTable } from "@/components/data-table";
import type {
  CreatePaymentType,
  PaymentDraftType,
  PaymentType,
} from "@/components/schemas/payment.schema";
import { paymentColumns } from "@/components/columns/payment.column";
import { useEffect, useState } from "react";
import { handleAxiosError } from "@/lib/utils";
import { toast } from "sonner";
import PageTitle from "@/components/Title";
import PaymentModal from "@/components/modals/payment.modal";
import { useCreateFormManager } from "@/hooks/use-custom-manager";

type PaymentProps = {
  isUseTitle?: boolean;
};

const Payment = ({ isUseTitle = true }: PaymentProps) => {
  const [data, setData] = useState<PaymentType[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const { formManager, onAdd, onClose } = useCreateFormManager();

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

  const handleSubmit = async (data: PaymentDraftType) => {
    console.log("dataaaaaaaaa", data);
    const payload: CreatePaymentType = {
      amount: data.amount,
      method: data.method,
      note: data.note,
      transactionId: data.transactionId,
    };
    console.log("payloadddddd", payload);

    try {
      await api.post("/payments", payload);
      fetchData();
      toast.success("Create payment success!");
    } catch (error) {
      handleAxiosError(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize]);

  return (
    <div className="p-4">
      {isUseTitle && <PageTitle title="Payment"></PageTitle>}

      <DataTable
        columns={paymentColumns}
        data={data}
        onAdd={onAdd}
        total={total}
        pageIndex={pageIndex}
        pageSize={pageSize}
        setPageIndex={setPageIndex}
        setPageSize={setPageSize}
      />

      <PaymentModal
        formManager={formManager}
        handleSubmit={handleSubmit}
        onClose={onClose}
      ></PaymentModal>
    </div>
  );
};

export default Payment;
