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
import {
  useCreateFormManager,
  useSelectedItemFormManager,
} from "@/hooks/use-custom-manager";
import PaymentModal from "@/components/modals/payment.modal";
import type { PaymentDraftType } from "@/components/schemas/payment.schema";
import { useSourceActions } from "@/hooks/useSourceAction";
import { useLoading } from "@/components/contexts/loading.context";
import { useAuth } from "@/auth/useAuth";
import { RequirePermission } from "@/components/commons/require-permission";

type TransactionProps = {
  isUseTitle?: boolean;
};

const Transaction = ({ isUseTitle = true }: TransactionProps) => {
  const { setLoading } = useLoading();
  const { fetchPermissions } = useAuth();

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
      setLoading(true);
      await api.post("/transactions", formData);
      fetchData();
      toast.success("Add transaction success!");
      onClose();
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setLoading(false);
    }
  };

  const { formManager, onAdd, onClose } = useCreateFormManager();

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        await fetchPermissions(["transaction"]);
        await fetchData();
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [pageIndex, pageSize]);
  const {
    formManager: paymentFormManager,
    onAdd: onAddPayment,
    onClose: onClosePayment,
  } = useSelectedItemFormManager();

  const { handleAddPayment } = useSourceActions(fetchData);

  const onAddSubmitPayment = async (paymentDraftType: PaymentDraftType) => {
    if (!paymentFormManager.selectedItemId) return;

    const isSuccess = await handleAddPayment(
      paymentDraftType,
      paymentFormManager.selectedItemId
    );
    if (isSuccess) onClosePayment();
  };

  return (
    <div className="p-4">
      {isUseTitle && <PageTitle title="Transaction"></PageTitle>}
      <RequirePermission permission="transaction:read">
        <DataTable
          columns={transactionColumns({
            onAddPayment,
          })}
          data={data}
          onAdd={onAdd}
          total={total}
          pageIndex={pageIndex}
          pageSize={pageSize}
          setPageIndex={setPageIndex}
          setPageSize={setPageSize}
          permission={"transaction:create"}
        />
      </RequirePermission>

      {/* Transaction modal */}
      <TransactionModal
        formManager={formManager}
        onClose={onClose}
        handleSubmit={handleSubmit}
      ></TransactionModal>

      {/* Add payment modal */}
      <PaymentModal
        formManager={paymentFormManager}
        handleSubmit={onAddSubmitPayment}
        onClose={onClosePayment}
      ></PaymentModal>
    </div>
  );
};

export default Transaction;
