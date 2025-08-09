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
import type { ConsignmentDetailType } from "@/components/schemas/source-detail.schema";
import { DataTable } from "@/components/data-table";
import { itemColumns } from "@/components/columns/item.column";
import { paymentColumns } from "@/components/columns/payment.column";
import { getTransactionStatusStyle } from "@/components/styles/TransactionStatus";
import {
  getConsignmentTypeIcon,
  getSourceStatusStyle,
} from "@/components/styles/SourceStatus";
import type { TransactionType } from "@/components/schemas/transaction.schema";
import DisplayUser from "@/components/DisplayUser";
import { useSourceActions } from "@/hooks/useSourceAction";
import { useItemActions } from "@/hooks/useItemAction";
import type { ItemDraftListType } from "@/components/schemas/item.schema";
import { toast } from "sonner";
import type { PaymentDraftType } from "@/components/schemas/payment.schema";
import PageTitle from "@/components/Title";
import ItemModal from "@/components/modals/item.modal";
import {
  useCreateFormManager,
  useSelectedItemFormManager,
} from "@/hooks/use-custom-manager";
import ExportImportModal from "@/components/modals/export-import.modal";
import PaymentModal from "@/components/modals/payment.modal";
type ConsignmentDetailsProps = { isUseTitle?: boolean };

const ConsignmentDetails = ({ isUseTitle = true }: ConsignmentDetailsProps) => {
  const { id } = useParams();
  const [consignment, setConsignment] = useState<ConsignmentDetailType | null>(
    null
  );
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
      const consignmentReponse = await api.get(`/consignments/${id}`);
      setConsignment(consignmentReponse.data.consignment);

      const transactionReponse = await api.get(
        `/transactions/consignments/${id}`
      );
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

  const onSubmitAddItem = async (itemDraftList: ItemDraftListType) => {
    if (!consignment) {
      toast.error("Consignment ID is required!");
      return;
    }
    const isSuccess = await handleAddItemList(
      itemDraftList,
      consignment?.id,
      "Consignment"
    );
    if (isSuccess) onCloseItem();
  };

  const onSubmitAddPayment = async (paymentDraftType: PaymentDraftType) => {
    if (!transaction?.id) return;

    const isSuccess = await handleAddPayment(paymentDraftType, transaction?.id);
    if (isSuccess) onClosePayment();
  };

  const onRemove = (itemId: number) => {
    if (!consignment) {
      toast.error("Consignment ID is required!");
      return;
    }
    handleRemove(itemId, consignment.id, "Consignment");
  };

  const onSubmitExportImport = async (quantity: number) => {
    if (!exportImportFormManager.selectedItemId) {
      toast.error("Item ID is required to export/import product!");
      return;
    }

    const isSuccess = await handleExportImportItem(
      exportImportFormManager.selectedItemId,
      "Consignment",
      quantity,
      consignment?.type
    );
    if (isSuccess) onCloseExportImport();
  };

  return (
    <>
      <div className="p-4">
        {isUseTitle && <PageTitle title="Consignment Detail"></PageTitle>}

        <div className="flex pb-3 space-x-5">
          <h1 className="text-2xl font-bold">Consignment ID: {id}</h1>
          <h1
            className={`flex  px-5 py-1 rounded-xl font-bold ${getTransactionStatusStyle(
              transaction?.status
            )}`}
          >
            {transaction?.status}
          </h1>

          <h1
            className={`flex  px-5 py-1 rounded-xl font-bold ${getSourceStatusStyle(
              consignment?.status
            )}`}
          >
            {consignment?.status}
          </h1>

          <h1
            className={`flex px-5 py-1 rounded-xl font-bold ${getConsignmentTypeIcon(
              consignment?.type
            )}`}
          >
            {consignment?.type} Consignment
          </h1>
        </div>

        <div className="flex flex-col space-y-5">
          <DataTable
            columns={itemColumns({
              hasAction: true,
              onRemove,
              onAddExportImport,
              consignmentType: consignment?.type,
            })}
            onAdd={consignment?.status !== "Cancelled" ? onAddItem : undefined}
            data={consignment?.items ?? []}
            pageIndex={0}
            pageSize={consignment?.items?.length ?? 10}
            total={consignment?.items?.length ?? 0}
            setPageIndex={() => {}}
            setPageSize={() => {}}
            title={"Add Item"}
          ></DataTable>

          <div className="border-1 my-4"></div>

          <DataTable
            onAdd={
              consignment?.status !== "Cancelled" ? onAddPayment : undefined
            }
            columns={paymentColumns}
            data={transaction?.payments ?? []}
            pageIndex={0}
            pageSize={consignment?.items?.length ?? 10}
            total={consignment?.items?.length ?? 0}
            setPageIndex={() => {}}
            setPageSize={() => {}}
            title={"Add Payment"}
          ></DataTable>
        </div>

        <div className="border-1 my-4"></div>

        <div className="flex flex-1 flex-col md:flex-row pt-5 rounded-xl text-gray-500 shadow-xl text-md md:text-xl ">
          <div className="flex-1/3 grid md:grid-rows-3 p-5 gap-5">
            <DisplayUser
              fullName={consignment?.partner.fullName}
              email={consignment?.partner.email}
              phoneNumber={consignment?.partner.phoneNumber}
              title={consignment?.type === "In" ? "Supplier" : "Customer"}
            ></DisplayUser>

            <DisplayUser
              fullName={consignment?.creator.fullName}
              email={consignment?.creator.email}
              phoneNumber={consignment?.creator?.phoneNumber ?? undefined}
              title={"Creator"}
            ></DisplayUser>
          </div>

          <div className="flex flex-1/3 flex-col p-5 space-y-5">
            <Card>
              <CardHeader>
                <CardTitle className="border-b-2 pb-3">Note</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-5">
                <span>{consignment?.note}</span>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="border-b-2 pb-3">
                  Consignment Summary
                </CardTitle>
              </CardHeader>

              <CardContent className="flex justify-between">
                <h1>Quantity: </h1>
                <p>{consignment?.quantity ?? 0}</p>
              </CardContent>

              <CardContent className="flex justify-between">
                <h1>Subtotal: </h1>
                <p>{formatCurrency(consignment?.totalAmount ?? 0)}</p>
              </CardContent>

              <CardContent className="flex justify-between">
                <h1>Commission Rate: </h1>
                <p>{consignment?.commissionRate ?? 0}%</p>
              </CardContent>

              <CardFooter className="flex justify-between border-t-2 pt-2 ">
                <h1 className="font-bold">Total: </h1>
                <p>{formatCurrency(consignment?.finalAmount ?? 0)}</p>
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

              <CardContent className="flex justify-between ">
                <h1>Paid: </h1>
                <p>{formatCurrency(transaction?.paidAmount ?? 0)}</p>
              </CardContent>

              <CardContent className="flex justify-between">
                <h1>Remain: </h1>
                <p>
                  {formatCurrency(
                    (consignment?.finalAmount ?? 0) -
                      (transaction?.paidAmount ?? 0)
                  )}
                </p>
              </CardContent>

              <CardFooter className="flex justify-between border-t-2 pt-2">
                <h1 className="font-bold">Total: </h1>
                <p>{formatCurrency(consignment?.finalAmount ?? 0)}</p>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* ============================================MODAL============================================ */}
        {/* Add item modal */}
        <ItemModal
          formManager={itemFormManager}
          handleSubmit={onSubmitAddItem}
          onClose={onCloseItem}
          source={"Consignment"}
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

export default ConsignmentDetails;
