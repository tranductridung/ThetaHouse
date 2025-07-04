import api from "@/api/api";
import type {
  SourceType,
  TypeOfConsignment,
} from "@/components/constants/constants";
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

  const handleExportImport = async (
    sourceId: number,
    sourceType: SourceType,
    consignmentType?: TypeOfConsignment
  ) => {
    let url;
    let action;
    switch (sourceType) {
      case "Order":
        url = `orders/${sourceId}/export`;
        action = "Export";
        break;
      case "Purchase":
        url = `purchases/${sourceId}/import`;
        action = "Import";
        break;
      case "Consignment":
        url = `consignments/${sourceId}/handle`;
        action = consignmentType === "In" ? "Import" : "Export";
        break;
    }

    if (!url) {
      throw new Error(`Invalid source!`);
    }

    try {
      const response = await api.post(url);
      console.log(response);
      toast.success(`${action} ${sourceType} success!`);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  return {
    handleAddPayment,
    handleExportImport,
  };
};
