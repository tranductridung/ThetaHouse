import type {
  CreateTransactionType,
  TransactionType,
} from "@/components/schemas/transaction.schema";
import api from "@/api/api";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { handleAxiosError } from "@/lib/utils";
import { DataTable } from "@/components/data-table";
import { transactionColumns } from "@/components/columns/transaction.column";
import PageTitle from "@/components/Title";
import TransactionModal from "@/components/modals/transaction.modal";
import { useCreateFormManager } from "@/hooks/use-custom-manager";

type TransactionProps = {
  isUseTitle?: boolean;
};

const Transaction = ({ isUseTitle = true }: TransactionProps) => {
  const [data, setData] = useState<TransactionType[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchData = async () => {
    try {
      const response = await api.get(
        `/transactions?page=${pageIndex}&limit=${pageSize}`
      );
      setData(response.data.transactions);
      setTotal(response.data.total);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleSubmit = async (formData: CreateTransactionType) => {
    try {
      await api.post("/transactions", {
        ...formData,
        // paidAmount: 0,
      });
      fetchData();
      toast.success("Add transaction success!");

      setFormManager({
        isShow: false,
        data: null,
      });
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const { formManager, setFormManager, onAdd, onClose } =
    useCreateFormManager();

  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize]);

  return (
    <div className="p-4">
      {isUseTitle && <PageTitle title="Transaction"></PageTitle>}
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

      <TransactionModal
        formManager={formManager}
        onClose={onClose}
        handleSubmit={handleSubmit}
      ></TransactionModal>
    </div>
  );
};

export default Transaction;
