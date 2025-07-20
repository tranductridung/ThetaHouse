import api from "@/api/api";
import { formatCurrency, handleAxiosError } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { OrderDetailType } from "@/components/schemas/source-detail.schema";
import { DataTable } from "@/components/data-table";
import { itemColumns } from "@/components/columns/item.column";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { paymentColumns } from "@/components/columns/payment.column";
import { getSourceStatusStyle } from "@/components/styles/SourceStatus";
import { getTransactionStatusStyle } from "@/components/styles/TransactionStatus";
import type { TransactionType } from "@/components/schemas/transaction.schema";
import DisplayUser from "@/components/DisplayUser";
import { type AppointmentDraftType } from "@/components/schemas/appointment.schema";
import { useItemActions } from "@/hooks/useItemAction";
import { toast } from "sonner";
import type { ItemDraftType } from "@/components/schemas/item.schema";
import type { PaymentDraftType } from "@/components/schemas/payment.schema";
import { useSourceActions } from "@/hooks/useSourceAction";
import PageTitle from "@/components/Title";
import {
  useCreateFormManager,
  useSelectedItemFormManager,
} from "@/hooks/use-custom-manager";
import AppointmentModal from "@/components/modals/appointment.modal";
import PaymentModal from "@/components/modals/payment.modal";
import ExportImportModal from "@/components/modals/export-import.modal";
import ItemModal from "@/components/modals/item.modal";

type OrderDetailProps = { isUseTitle?: boolean };

const OrderDetails = ({ isUseTitle = true }: OrderDetailProps) => {
  const { id } = useParams();
  const [order, setOrder] = useState<OrderDetailType | null>(null);
  const [transaction, setTransaction] = useState<TransactionType | null>(null);
  const {
    formManager: appointmentFormManager,
    onAdd: onCreateAppointment,
    onClose: onCloseAppointment,
  } = useSelectedItemFormManager();

  const {
    formManager: paymentFormManager,
    onAdd: onAddPayment,
    onClose: onClosePayment,
  } = useCreateFormManager();

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

  const fetchData = async () => {
    try {
      const orderReponse = await api.get(`/orders/${id}`);
      setOrder(orderReponse.data.order);

      const transactionReponse = await api.get(`/transactions/orders/${id}`);
      setTransaction(transactionReponse.data.transaction);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const {
    handleAddItem,
    handleRemove,
    handleCreateAppointmnet,
    handleExportImportItem,
  } = useItemActions(fetchData);

  const { handleAddPayment } = useSourceActions(fetchData);

  const onSubmitAddAppointment = async (formData: AppointmentDraftType) => {
    if (!appointmentFormManager.selectedItemId) {
      toast.error("Item ID is required to create appointment!");
      return;
    }

    if (!order?.customer?.id) return;

    await handleCreateAppointmnet(
      formData,
      order?.customer?.id,
      appointmentFormManager.selectedItemId
    );
    onCloseAppointment();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmitAddItem = (itemDraftType: ItemDraftType) => {
    console.log("add item", itemDraftType);
    if (!order) {
      toast.error("Order ID is required!");
      return;
    }
    handleAddItem(itemDraftType, order?.id, "Order");
    onCloseItem();
  };

  const onAddSubmitPayment = async (paymentDraftType: PaymentDraftType) => {
    if (!transaction?.id || !order?.customer?.id) return;

    await handleAddPayment(
      paymentDraftType,
      transaction?.id,
      order?.customer?.id
    );
    onClosePayment();
  };

  const onRemove = (itemId: number) => {
    if (!order) {
      toast.error("Order ID is required!");
      return;
    }
    handleRemove(itemId, order.id, "Order");
  };

  const onSubmitExportImport = (quantity: number) => {
    if (!exportImportFormManager.selectedItemId) {
      toast.error("Item ID is required to export/import product!");
      return;
    }

    handleExportImportItem(
      exportImportFormManager.selectedItemId,
      "Order",
      quantity
    );
    onCloseExportImport();
  };

  console.log("payment", transaction?.payments);
  return (
    <>
      <div className="p-4">
        {isUseTitle && <PageTitle title="Order Detail"></PageTitle>}
        <div className="flex pb-3 space-x-5">
          <h1 className="text-2xl font-bold">Order ID: {id}</h1>
          <h1
            className={`flex  px-5 py-1 rounded-xl font-bold ${getTransactionStatusStyle(
              transaction?.status
            )}`}
          >
            {transaction?.status}
          </h1>

          <h1
            className={`flex  px-5 py-1 rounded-xl font-bold ${getSourceStatusStyle(
              order?.status
            )}`}
          >
            {order?.status}
          </h1>
        </div>
        <div className="flex flex-col space-y-5">
          <DataTable
            columns={itemColumns({
              onCreateAppointment,
              onRemove,
              onAddExportImport,
            })}
            onAdd={order?.status !== "Cancelled" ? onAddItem : undefined}
            data={order?.items ?? []}
            pageIndex={0}
            pageSize={order?.items?.length ?? 10}
            total={order?.items?.length ?? 0}
            setPageIndex={() => {}}
            setPageSize={() => {}}
            title={"Add Item"}
          ></DataTable>

          <div className="border-1 my-4"></div>

          <DataTable
            onAdd={order?.status !== "Cancelled" ? onAddPayment : undefined}
            columns={paymentColumns}
            data={transaction?.payments ?? []}
            pageIndex={0}
            pageSize={order?.items?.length ?? 10}
            total={order?.items?.length ?? 0}
            setPageIndex={() => {}}
            setPageSize={() => {}}
            title={"Add Payment"}
          ></DataTable>
        </div>
        <div className="border-1 my-4"></div>
        <div className="flex flex-1 flex-col md:flex-row pt-5 rounded-xl text-gray-500 shadow-xl text-md md:text-xl ">
          <div className="flex-1/3 grid md:grid-rows-3 p-5 gap-5">
            <DisplayUser
              fullName={order?.customer.fullName}
              email={order?.customer.email}
              phoneNumber={order?.customer.phoneNumber}
              title={"Customer"}
            ></DisplayUser>

            <DisplayUser
              fullName={order?.creator.fullName}
              email={order?.creator.email}
              phoneNumber={order?.creator.phoneNumber}
              title={"Creator"}
            ></DisplayUser>
          </div>

          <div className="flex flex-1/3 flex-col p-5 space-y-5 h-fit">
            <Card>
              <CardHeader>
                <CardTitle className="border-b-2 pb-3">Note</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-5">
                <span>{order?.note}</span>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="border-b-2 pb-3">Order Summary</CardTitle>
              </CardHeader>

              <CardContent className="flex justify-between">
                <h1>Quantity: </h1>
                <p>{order?.quantity}</p>
              </CardContent>

              <CardContent className="flex justify-between">
                <h1>Subtotal: </h1>
                <p>{formatCurrency(order?.totalAmount ?? 0)}</p>
              </CardContent>

              <CardContent className="flex justify-between">
                <h1>Discount: </h1>
                <p>{order?.discount?.code ?? "No Discount"}</p>
              </CardContent>

              <CardFooter className="flex justify-between border-t-2">
                <h1 className="font-bold">Total: </h1>
                <p>{formatCurrency(order?.finalAmount ?? 0)}</p>
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
                    (order?.finalAmount ?? 0) - (transaction?.paidAmount ?? 0)
                  )}
                </p>
              </CardContent>

              <CardFooter className="flex justify-between border-t-2">
                <h1 className="font-bold">Total: </h1>
                <p>{formatCurrency(order?.finalAmount ?? 0)}</p>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* ==========================================MODAL========================================== */}
        {/* Create appointment modal */}
        <AppointmentModal
          formManager={appointmentFormManager}
          onClose={onCloseAppointment}
          onSubmitAddAppointment={onSubmitAddAppointment}
        ></AppointmentModal>

        {/* Add item modal */}
        <ItemModal
          formManager={itemFormManager}
          handleSubmit={onSubmitAddItem}
          onClose={onCloseItem}
        ></ItemModal>

        {/* Add payment modal */}
        <PaymentModal
          formManager={paymentFormManager}
          handleSubmit={onAddSubmitPayment}
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

export default OrderDetails;
