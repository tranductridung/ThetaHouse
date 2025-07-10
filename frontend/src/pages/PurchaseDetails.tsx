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
import type { PurchaseDetailType } from "@/components/schemas/sourceDetail";
import { DataTable } from "@/components/data-table";
import { itemColumns } from "@/components/columns/item-column";
import { paymentColumns } from "@/components/columns/payment-column";
import { getSourceStatusStyle } from "@/components/styles/SourceStatus";
import { getTransactionStatusStyle } from "@/components/styles/TransactionStatus";
import type { TransactionType } from "@/components/schemas/transaction";
import DisplayUser from "@/components/DisplayUser";
import { useItemActions } from "@/hooks/useItemAction";
import { toast } from "sonner";
import type { ItemDraftType } from "@/components/schemas/item";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import AddItemForm from "@/components/forms/AddItemForm";
import { useSourceActions } from "@/hooks/useSourceAction";
import type { PaymentDraftType } from "@/components/schemas/payment";
import AddPaymentForm from "@/components/forms/AddPaymentForm";
import ExportImportForm from "@/components/forms/ExportImportForm";

const PurchaseDetails = () => {
  const { id } = useParams();
  const [purchase, setPurchase] = useState<PurchaseDetailType | null>(null);
  const [transaction, setTransaction] = useState<TransactionType | null>(null);
  const [isShowAddPayment, setIsShowAddPayment] = useState(false);
  const [isShowAddItem, setIsShowAddItem] = useState(false);
  const [exportImportForm, setExportImportForm] = useState<{
    selectedItemId: number | null;
    isShow: boolean;
  }>({ selectedItemId: null, isShow: false });

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

  const { handleAddItem, handleRemove, handleExportImportItem } =
    useItemActions(fetchData);
  const { handleAddPayment } = useSourceActions(fetchData);

  const onRemove = (itemId: number) => {
    console.log("on remove");
    if (!purchase) {
      toast.error("Purchase ID is required!");
      return;
    }
    handleRemove(itemId, purchase.id, "Purchase");
  };

  const openAddItem = () => {
    setIsShowAddItem(true);
  };

  const onAddPayment = async (paymentDraftType: PaymentDraftType) => {
    await handleAddPayment(paymentDraftType, transaction.id, undefined);
    setIsShowAddPayment(false);
  };

  const openPayment = () => {
    setIsShowAddPayment(true);
  };

  const onAddItem = (itemDraftType: ItemDraftType) => {
    console.log("add item", itemDraftType);
    if (!purchase) {
      toast.error("Purchase ID is required!");
      return;
    }
    handleAddItem(itemDraftType, purchase?.id, "Purchase");
    setIsShowAddItem(false);
  };

  const onExportImport = (quantity: number) => {
    if (!exportImportForm.selectedItemId) {
      toast.error("Item ID is required to export/import product!");
      return;
    }

    handleExportImportItem(
      exportImportForm.selectedItemId,
      "Purchase",
      quantity
    );
    setExportImportForm({ isShow: false, selectedItemId: null });
  };

  const onOpenExportImport = (itemId: number) => {
    setExportImportForm({ isShow: true, selectedItemId: itemId });
  };

  console.log(purchase);
  return (
    <>
      <div className="p-4">
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
              onRemove,
              onOpenExportImport,
            })}
            onAdd={purchase?.status !== "Cancelled" ? openAddItem : undefined}
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
            onAdd={purchase?.status !== "Cancelled" ? openPayment : undefined}
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
              title={"Customer"}
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
                <p>{formatCurrency(transaction?.paidAmount)}</p>
              </CardContent>

              <CardContent className="flex justify-between">
                <h1>Remain: </h1>
                <p>
                  {formatCurrency(
                    purchase?.finalAmount - transaction?.paidAmount
                  )}
                </p>
              </CardContent>

              <CardFooter className="flex justify-between border-t-2 pt-2">
                <h1 className="font-bold">Total: </h1>
                <p>{formatCurrency(purchase?.finalAmount)}</p>
              </CardFooter>
            </Card>
          </div>
        </div>

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
            <AddItemForm onSubmit={onAddItem} isService={false} />
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

export default PurchaseDetails;
