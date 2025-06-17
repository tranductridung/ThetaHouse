import api from "@/api/api";
import { DataTable } from "@/components/data-table";
import type {
  CreatePaymentType,
  PaymentDraftType,
  PaymentType,
} from "@/components/schemas/payment";
import { paymentColumns } from "@/components/columns/payment-column";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import PaymentForm from "@/components/forms/PaymentForm";
import { handleAxiosError } from "@/lib/utils";
import { toast } from "sonner";

export type FormManagerType = {
  isShow: boolean;
  data: PaymentType | null;
};

const Payment = () => {
  const [data, setData] = useState<PaymentType[]>([]);
  const [formManager, setFormManager] = useState<FormManagerType>({
    isShow: false,
    data: null,
  });
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const handleSubmit = async (data: PaymentDraftType) => {
    const payload: CreatePaymentType = {
      amount: data.amount,
      method: data.method,
      note: data.note,
      transactionId: data.transaction.id,
      customerId: data.customer.id,
    };

    console.log("data", data);
    console.log("payload", payload);
    try {
      await api.post("/payments", payload);
      toast.success("Create payment success!");
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const onAdd = () => {
    setFormManager({
      isShow: true,
      data: null,
    });
  };

  useEffect(() => {
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
    fetchData();
  }, [pageIndex, pageSize]);

  return (
    <div className="p-4">
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

      <Dialog
        open={formManager.isShow}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setFormManager({
              isShow: false,
              data: null,
            });
          }
        }}
      >
        <DialogContent className="max-h-[80vh] overflow-y-auto overflow-x-auto">
          <DialogTitle></DialogTitle>
          <PaymentForm onSubmit={handleSubmit} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Payment;
