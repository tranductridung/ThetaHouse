import api from "@/api/api";
import { toast } from "sonner";
import type {
  ConsignmentTypeConst,
  SourceTypeConst,
} from "@/components/constants/constants";
import type {
  CreatePaymentType,
  PaymentDraftType,
} from "@/components/schemas/payment.schema";
import { handleAxiosError } from "@/lib/utils";

export const useSourceActions = (refetch: () => void) => {
  const handleAddPayment = async (
    paymentDraftType: PaymentDraftType,
    transactionId: number
  ) => {
    const payload: CreatePaymentType = {
      note: paymentDraftType.note,
      amount: paymentDraftType.amount,
      method: paymentDraftType.method,
      transactionId: transactionId,
    };
    try {
      await api.post(`payments`, payload);
      toast.success("Add payment success!");
      refetch();
      return true;
    } catch (error) {
      handleAxiosError(error);
      return false;
    }
  };

  const handleExportImport = async (
    sourceId: number,
    sourceType: SourceTypeConst,
    consignmentType?: ConsignmentTypeConst
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

    if (!url) throw new Error(`Invalid source!`);

    try {
      await api.post(url);
      toast.success(`${action} ${sourceType} success!`);
      return true;
    } catch (error) {
      handleAxiosError(error);
      return false;
    }
  };

  return {
    handleAddPayment,
    handleExportImport,
  };
};
