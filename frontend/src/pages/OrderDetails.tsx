import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import api from "@/api/api";
import { formatCurrency, handleAxiosError } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { OrderDetailType } from "@/components/schemas/sourceDetail";
import { DataTable } from "@/components/data-table";
import { itemColumns } from "@/components/columns/item-column";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { paymentColumns } from "@/components/columns/payment-column";
import { getSourceStatusStyle } from "@/components/styles/SourceStatus";
import { getTransactionStatusStyle } from "@/components/styles/TransactionStatus";
import type { TransactionType } from "@/components/schemas/transaction";
import DisplayUser from "@/components/DisplayUser";
import AppointmentForm from "@/components/forms/AppointmentForm";
import { type AppointmentDraftType } from "@/components/schemas/appointment";
import { useItemActions } from "@/hooks/useItemAction";
import { toast } from "sonner";
import type { ItemDraftType } from "@/components/schemas/item";
import AddItemForm from "@/components/forms/AddItemForm";
import AddPaymentForm from "@/components/forms/AddPaymentForm";
import type { PaymentDraftType } from "@/components/schemas/payment";
import { useSourceActions } from "@/hooks/useSourceAction";
import ExportImportForm from "@/components/forms/ExportImportForm";

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<OrderDetailType | null>(null);
  const [isShowAddItem, setIsShowAddItem] = useState(false);
  const [isShowAddPayment, setIsShowAddPayment] = useState(false);
  const [transaction, setTransaction] = useState<TransactionType | null>(null);
  const [isSelectOpen, setIsSelectOpen] = useState<boolean>(false);
  const [formManager, setFormManager] = useState<{
    selectedItemId: number | null;
    isShow: boolean;
  }>({ selectedItemId: null, isShow: false });

  const [exportImportForm, setExportImportForm] = useState<{
    selectedItemId: number | null;
    isShow: boolean;
  }>({ selectedItemId: null, isShow: false });

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

  // Open create appointment dialog
  const onCreateAppointment = (id: number) => {
    setFormManager({ selectedItemId: id, isShow: true });
  };

  const onSubmitCreateAppointment = (formData: AppointmentDraftType) => {
    if (!formManager.selectedItemId) {
      toast.error("Item ID is required to create appointment!");
      return;
    }

    const response = handleCreateAppointmnet(
      formData,
      order?.customer.id,
      formManager.selectedItemId
    );
    console.log(response);
    setFormManager({
      isShow: false,
      selectedItemId: null,
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onAddItem = (itemDraftType: ItemDraftType) => {
    console.log("add item", itemDraftType);
    if (!order) {
      toast.error("Order ID is required!");
      return;
    }
    handleAddItem(itemDraftType, order?.id, "Order");
    setIsShowAddItem(false);
  };

  const onAddPayment = async (paymentDraftType: PaymentDraftType) => {
    await handleAddPayment(
      paymentDraftType,
      transaction.id,
      order?.customer?.id
    );
    setIsShowAddPayment(false);
  };

  const onRemove = (itemId: number) => {
    console.log("on remove");
    if (!order) {
      toast.error("Order ID is required!");
      return;
    }
    handleRemove(itemId, order.id, "Order");
  };

  const openPayment = () => {
    setIsShowAddPayment(true);
  };

  const openAddItem = () => {
    setIsShowAddItem(true);
  };

  const onExportImport = (quantity: number) => {
    if (!exportImportForm.selectedItemId) {
      toast.error("Item ID is required to export/import product!");
      return;
    }

    handleExportImportItem(exportImportForm.selectedItemId, "Order", quantity);
    setExportImportForm({ isShow: false, selectedItemId: null });
  };

  const onOpenExportImport = (itemId: number) => {
    setExportImportForm({ isShow: true, selectedItemId: itemId });
  };

  console.log("payment", transaction?.payments);
  return (
    <>
      <div className="p-4">
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
              onOpenExportImport,
            })}
            onAdd={order?.status !== "Cancelled" ? openAddItem : undefined}
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
            onAdd={order?.status !== "Cancelled" ? openPayment : undefined}
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
                <p>{formatCurrency(order?.totalAmount)}</p>
              </CardContent>

              <CardContent className="flex justify-between">
                <h1>Discount: </h1>
                <p>{order?.discount?.code ?? "No Discount"}</p>
              </CardContent>

              <CardFooter className="flex justify-between border-t-2">
                <h1 className="font-bold">Total: </h1>
                <p>{formatCurrency(order?.finalAmount)}</p>
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
                <p>{formatCurrency(transaction?.paidAmount)}</p>
              </CardContent>

              <CardContent className="flex justify-between">
                <h1>Remain: </h1>
                <p>
                  {formatCurrency(order?.finalAmount - transaction?.paidAmount)}
                </p>
              </CardContent>

              <CardFooter className="flex justify-between border-t-2">
                <h1 className="font-bold">Total: </h1>
                <p>{formatCurrency(order?.finalAmount)}</p>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Create appointment dialog */}
        <Dialog
          open={formManager.isShow}
          modal={false}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setFormManager({
                isShow: false,
                selectedItemId: null,
              });
            }
          }}
        >
          <DialogContent
            onInteractOutside={(event) => {
              if (isSelectOpen) {
                event.preventDefault();
              }
            }}
          >
            <DialogTitle></DialogTitle>
            <AppointmentForm
              onSubmit={onSubmitCreateAppointment}
              appointmentData={null}
              type={"add"}
              setIsSelectOpen={setIsSelectOpen}
            />
          </DialogContent>
        </Dialog>

        {/* Add item dialog */}
        <Dialog
          open={isShowAddItem}
          modal={false}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setIsShowAddItem(false);
            }
          }}
        >
          <DialogContent>
            <DialogTitle></DialogTitle>
            <AddItemForm onSubmit={onAddItem} isService={true} />
          </DialogContent>
        </Dialog>

        {/* Add payment dialog */}
        <Dialog
          open={isShowAddPayment}
          modal={false}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setIsShowAddPayment(false);
            }
          }}
        >
          <DialogContent>
            <DialogTitle></DialogTitle>
            <AddPaymentForm onSubmit={onAddPayment} />
          </DialogContent>
        </Dialog>

        {/* Export or Import item */}
        <Dialog
          open={exportImportForm.isShow}
          modal={false}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setExportImportForm({
                isShow: false,
                selectedItemId: null,
              });
            }
          }}
        >
          <DialogContent>
            <DialogTitle></DialogTitle>
            <ExportImportForm onSubmit={onExportImport} />
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default OrderDetails;
