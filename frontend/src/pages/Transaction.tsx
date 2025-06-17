import type {
  CreateTransactionType,
  TransactionType,
} from "@/components/schemas/transaction";
import api from "@/api/api";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { handleAxiosError } from "@/lib/utils";
import { DataTable } from "@/components/data-table";
import TransactionForm from "@/components/forms/TransactionForm";
import { transactionColumns } from "@/components/columns/transaction-column";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export type FormManagerType = {
  isShow: boolean;
  data: TransactionType | null;
};

const Transaction = () => {
  const [data, setData] = useState<TransactionType[]>([]);
  const [formManager, setFormManager] = useState<FormManagerType>({
    isShow: false,
    data: null,
  });
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const handleSubmit = async (formData: CreateTransactionType) => {
    try {
      console.log("formData", formData);

      const response = await api.post("/transactions", {
        ...formData,
        paidAmount: 0,
      });

      console.log(response.data);
      setData((prev) => [...prev, response.data.transaction]);

      setFormManager({
        isShow: false,
        data: null,
      });

      toast.success("Add transaction success!");
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
    try {
      const fetchData = async () => {
        const response = await api.get(
          `/transactions?page=${pageIndex}&limit=${pageSize}`
        );
        setData(response.data.transactions);
        setTotal(response.data.total);
      };
      fetchData();
    } catch (error) {
      handleAxiosError(error);
    }
  }, [pageIndex, pageSize]);

  return (
    <div className="p-4">
      <DataTable
        columns={transactionColumns}
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
        <DialogContent>
          <DialogTitle></DialogTitle>
          <TransactionForm onSubmit={handleSubmit} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Transaction;
