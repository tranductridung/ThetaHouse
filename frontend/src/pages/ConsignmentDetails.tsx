import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
import type { ConsignmentDetailType } from "@/components/schemas/sourceDetail";
import { DataTable } from "@/components/data-table";
import { itemColumns } from "@/components/columns/item-column";
import { paymentColumns } from "@/components/columns/payment-column";
import { getTransactionStatusStyle } from "@/components/styles/TransactionStatus";
import {
  getConsignmentTypeIcon,
  getSourceStatusStyle,
} from "@/components/styles/SourceStatus";
import type { TransactionType } from "@/components/schemas/transaction";
import DisplayUser from "@/components/DisplayUser";
import { useSourceActions } from "@/hooks/useSourceAction";
import { useItemActions } from "@/hooks/useItemAction";
import type { ItemDraftType } from "@/components/schemas/item";
import { toast } from "sonner";
import type { PaymentDraftType } from "@/components/schemas/payment";
import AddItemForm from "@/components/forms/AddItemForm";
import AddPaymentForm from "@/components/forms/AddPaymentForm";
import ExportImportForm from "@/components/forms/ExportImportForm";

const ConsignmentDetails = () => {
  const { id } = useParams();
  const [consignment, setConsignment] = useState<ConsignmentDetailType | null>(
    null
  );
  const [transaction, setTransaction] = useState<TransactionType | null>(null);
  const [isShowAddItem, setIsShowAddItem] = useState(false);
  const [isShowAddPayment, setIsShowAddPayment] = useState(false);

  const [exportImportForm, setExportImportForm] = useState<{
    selectedItemId: number | null;
    isShow: boolean;
  }>({ selectedItemId: null, isShow: false });

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

  const { handleAddItem, handleRemove, handleExportImportItem } =
    useItemActions(fetchData);
  const { handleAddPayment } = useSourceActions(fetchData);

  const onAddItem = (itemDraftType: ItemDraftType) => {
    console.log("add item", itemDraftType);
    if (!consignment) {
      toast.error("Consignment ID is required!");
      return;
    }
    handleAddItem(itemDraftType, consignment?.id, "Consignment");
    setIsShowAddItem(false);
  };

  const onAddPayment = async (paymentDraftType: PaymentDraftType) => {
    const partnerId =
      consignment?.type === "In" ? undefined : consignment?.partner.id;

    console.log("--------", consignment, partnerId);

    await handleAddPayment(
      paymentDraftType,
      transaction.id,
      partnerId ? partnerId : undefined
    );
    setIsShowAddPayment(false);
  };

  const onRemove = (itemId: number) => {
    console.log("on remove");
    if (!consignment) {
      toast.error("Consignment ID is required!");
      return;
    }
    handleRemove(itemId, consignment.id, "Consignment");
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

    handleExportImportItem(
      exportImportForm.selectedItemId,
      "Consignment",
      quantity,
      consignment?.type
    );
    setExportImportForm({ isShow: false, selectedItemId: null });
  };

  const onOpenExportImport = (itemId: number) => {
    setExportImportForm({ isShow: true, selectedItemId: itemId });
  };

  return (
    <>
      <div className="p-4">
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
            {consignment?.type}
          </h1>
        </div>

        <div className="flex flex-col space-y-5">
          <DataTable
            columns={itemColumns({
              onRemove,
              onOpenExportImport,
              consignmentType: consignment?.type,
            })}
            onAdd={
              consignment?.status !== "Cancelled" ? openAddItem : undefined
            }
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
              consignment?.status !== "Cancelled" ? openPayment : undefined
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
              phoneNumber={consignment?.creator.phoneNumber}
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
                <p>{formatCurrency(transaction?.paidAmount)}</p>
              </CardContent>

              <CardContent className="flex justify-between">
                <h1>Remain: </h1>
                <p>
                  {formatCurrency(
                    consignment?.finalAmount - transaction?.paidAmount
                  )}
                </p>
              </CardContent>

              <CardFooter className="flex justify-between border-t-2 pt-2">
                <h1 className="font-bold">Total: </h1>
                <p>{formatCurrency(consignment?.finalAmount)}</p>
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

export default ConsignmentDetails;
