import api from "@/api/api";
import type {
  CreatePaymentType,
  PaymentDraftType,
} from "@/components/schemas/payment";
import { handleAxiosError } from "@/lib/utils";
import { toast } from "sonner";

export const useSourceActions = (refetch: () => void) => {
  const handleAddPayment = async (
    paymentDraftType: PaymentDraftType,
    transactionId: number
  ) => {
    const payload: CreatePaymentType = {
      note: paymentDraftType.note,
      amount: paymentDraftType.amount,
      method: paymentDraftType.method,
      customerId: paymentDraftType.customer.id,
      transactionId: transactionId,
    };

    try {
      await api.post(`payments`, payload);
      toast.success("Add payment success!");
      refetch();
    } catch (error) {
      handleAxiosError(error);
    }
  };

  return {
    handleAddPayment,
  };
};
