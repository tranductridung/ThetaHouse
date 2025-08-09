import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import api from "@/api/api";
import { formatCurrency, handleAxiosError } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { PurchaseDetailType } from "@/components/schemas/source-detail.schema";
import { DataTable } from "@/components/data-table";
import { itemColumns } from "@/components/columns/item.column";
import { paymentColumns } from "@/components/columns/payment.column";
import { getSourceStatusStyle } from "@/components/styles/SourceStatus";
import { getTransactionStatusStyle } from "@/components/styles/TransactionStatus";
import type { TransactionType } from "@/components/schemas/transaction.schema";
import DisplayUser from "@/components/DisplayUser";
import { useItemActions } from "@/hooks/useItemAction";
import { toast } from "sonner";
import type { ItemDraftListType } from "@/components/schemas/item.schema";
import { useSourceActions } from "@/hooks/useSourceAction";
import type { PaymentDraftType } from "@/components/schemas/payment.schema";
import PageTitle from "@/components/Title";
import {
  useCreateFormManager,
  useSelectedItemFormManager,
} from "@/hooks/use-custom-manager";
import ExportImportModal from "@/components/modals/export-import.modal";
import ItemModal from "@/components/modals/item.modal";
import PaymentModal from "@/components/modals/payment.modal";

type PurchaseDetailProps = {
  isUseTitle?: boolean;
};
const PurchaseDetails = ({ isUseTitle = true }: PurchaseDetailProps) => {
  const { id } = useParams();
  const [purchase, setPurchase] = useState<PurchaseDetailType | null>(null);
  const [transaction, setTransaction] = useState<TransactionType | null>(null);
  const {
    formManager: exportImportFormManager,
    onAdd: onAddExportImport,
    onClose: onCloseExportImport,
  } = useSelectedItemFormManager();

  const {
    formManager: itemFormManager,
    onAdd: onAddItem,
    onClose: onCloseItem,
  } = useCreateFormManager();

  const {
    formManager: paymentFormManager,
    onAdd: onAddPayment,
    onClose: onClosePayment,
  } = useCreateFormManager();

  const fetchData = async () => {
    try {
      const purchaseReponse = await api.get(`/purchases/${id}`);
      setPurchase(purchaseReponse.data.purchase);

      const transactionReponse = await api.get(`/transactions/purchases/${id}`);
      setTransaction(transactionReponse.data.transaction);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const { handleAddItemList, handleRemove, handleExportImportItem } =
    useItemActions(fetchData);
  const { handleAddPayment } = useSourceActions(fetchData);

  const onRemove = async (itemId: number) => {
    if (!purchase) {
      toast.error("Purchase ID is required!");
      return;
    }
    await handleRemove(itemId, purchase.id, "Purchase");
  };

  const onSubmitAddPayment = async (paymentDraftType: PaymentDraftType) => {
    if (!transaction?.id) return;

    const isSuccess = await handleAddPayment(paymentDraftType, transaction?.id);
    if (isSuccess) onClosePayment();
  };

  const onSubmitAddItem = async (itemDraftList: ItemDraftListType) => {
    if (!purchase) {
      toast.error("Purchase ID is required!");
      return;
    }

    const isSuccesss = await handleAddItemList(
      itemDraftList,
      purchase?.id,
      "Purchase"
    );
    if (isSuccesss) onCloseItem();
  };

  const onSubmitExportImport = async (quantity: number) => {
    if (!exportImportFormManager.selectedItemId) {
      toast.error("Item ID is required to export/import product!");
      return;
    }

    const isSuccess = await handleExportImportItem(
      exportImportFormManager.selectedItemId,
      "Purchase",
      quantity
    );
    if (isSuccess) onCloseExportImport();
  };

  return (
    <>
      <div className="p-4">
        {isUseTitle && <PageTitle title="Purchase Detail"></PageTitle>}
        <div className="flex pb-3 space-x-5">
          <h1 className="text-2xl font-bold">Purchase ID: {id}</h1>
          <h1
            className={`flex  px-5 py-1 rounded-xl font-bold ${getTransactionStatusStyle(
              transaction?.status
            )}`}
          >
            {transaction?.status}
          </h1>

          <h1
            className={`flex  px-5 py-1 rounded-xl font-bold ${getSourceStatusStyle(
              purchase?.status
            )}`}
          >
            {purchase?.status}
          </h1>
        </div>
        <div className="flex flex-col space-y-5">
          <DataTable
            columns={itemColumns({
              hasAction: true,
              onRemove,
              onAddExportImport,
            })}
            onAdd={purchase?.status !== "Cancelled" ? onAddItem : undefined}
            data={purchase?.items ?? []}
            pageIndex={0}
            pageSize={purchase?.items?.length ?? 10}
            total={purchase?.items?.length ?? 0}
            setPageIndex={() => {}}
            setPageSize={() => {}}
            title={"Add Item"}
          ></DataTable>

          <div className="border-1 my-4"></div>

          <DataTable
            onAdd={purchase?.status !== "Cancelled" ? onAddPayment : undefined}
            columns={paymentColumns}
            data={transaction?.payments ?? []}
            pageIndex={0}
            pageSize={purchase?.items?.length ?? 10}
            total={purchase?.items?.length ?? 0}
            setPageIndex={() => {}}
            setPageSize={() => {}}
            title={"Add Payment"}
          ></DataTable>
        </div>
        <div className="border-1 my-4"></div>
        <div className="flex flex-1 flex-col md:flex-row pt-5 rounded-xl text-gray-500 shadow-xl text-md md:text-xl ">
          <div className="flex-1/3 grid md:grid-rows-3 p-5 gap-5">
            <DisplayUser
              fullName={purchase?.supplier.fullName}
              email={purchase?.supplier.email}
              phoneNumber={purchase?.supplier.phoneNumber}
              title={"Supplier"}
            ></DisplayUser>

            <DisplayUser
              fullName={purchase?.creator.fullName}
              email={purchase?.creator.email}
              phoneNumber={purchase?.creator.phoneNumber}
              title={"Creator"}
            ></DisplayUser>
          </div>

          <div className="flex flex-1/3 flex-col p-5 space-y-5">
            <Card>
              <CardHeader>
                <CardTitle className="border-b-2 pb-3">Note</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-5">
                <span>{purchase?.note}</span>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="border-b-2 pb-3">
                  Purchase Summary
                </CardTitle>
              </CardHeader>

              <CardContent className="flex justify-between">
                <h1>Quantity: </h1>
                <p>{purchase?.quantity ?? 0}</p>
              </CardContent>

              <CardContent className="flex justify-between">
                <h1>Subtotal: </h1>
                <p>{formatCurrency(purchase?.totalAmount ?? 0)}</p>
              </CardContent>

              <CardContent className="flex justify-between">
                <h1>Discount: </h1>
                <p>{formatCurrency(purchase?.discountAmount ?? 0)}</p>
              </CardContent>

              <CardFooter className="flex justify-between border-t-2 pt-2 ">
                <h1 className="font-bold">Total: </h1>
                <p>{formatCurrency(purchase?.finalAmount ?? 0)}</p>
              </CardFooter>
            </Card>
          </div>

          <div className="flex flex-1/3 flex-col p-5 space-y-5">
            <Card>
              <CardHeader>
                <CardTitle className="border-b-2 pb-3">
                  Payment Summary
                </CardTitle>
              </CardHeader>

              <CardContent className="flex justify-between">
                <h1>Paid: </h1>
                <p>{formatCurrency(transaction?.paidAmount ?? 0)}</p>
              </CardContent>

              <CardContent className="flex justify-between">
                <h1>Remain: </h1>
                <p>
                  {formatCurrency(
                    (purchase?.finalAmount ?? 0) -
                      (transaction?.paidAmount ?? 0)
                  )}
                </p>
              </CardContent>

              <CardFooter className="flex justify-between border-t-2 pt-2">
                <h1 className="font-bold">Total: </h1>
                <p>{formatCurrency(purchase?.finalAmount ?? 0)}</p>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* ==============================================MODAL============================================== */}
        {/* Add item modal */}
        <ItemModal
          formManager={itemFormManager}
          handleSubmit={onSubmitAddItem}
          onClose={onCloseItem}
          source={"Purchase"}
        ></ItemModal>
        {/* Add payment modal */}
        <PaymentModal
          formManager={paymentFormManager}
          handleSubmit={onSubmitAddPayment}
          onClose={onClosePayment}
        ></PaymentModal>
        {/* Export or Import item modal */}
        <ExportImportModal
          formManager={exportImportFormManager}
          handleSubmit={onSubmitExportImport}
          onClose={onCloseExportImport}
        ></ExportImportModal>
      </div>
    </>
  );
};

export default PurchaseDetails;
