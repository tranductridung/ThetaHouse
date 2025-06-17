import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import api from "@/api/api";
import { handleAxiosError } from "@/lib/utils";
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

const PurchaseDetails = () => {
  const { id } = useParams();
  const [purchase, setPurchase] = useState<PurchaseDetailType | null>(null);
  const [transaction, setTransaction] = useState<TransactionType | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const purchaseReponse = await api.get(`/purchases/${id}`);
        setPurchase(purchaseReponse.data.purchase);

        const transactionReponse = await api.get(
          `/transactions/purchases/${id}`
        );
        setTransaction(transactionReponse.data.transaction);
      } catch (error) {
        handleAxiosError(error);
      }
    };

    fetchData();
  }, []);

  const filteredColumns = itemColumns.filter((col) => {
    if (
      col.header === "Session" ||
      col.header === "Discount Code" ||
      col.header === "Bonus Session"
    ) {
      return false;
    }
    return true;
  });

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
            columns={filteredColumns}
            data={purchase?.items ?? []}
            pageIndex={0}
            pageSize={purchase?.items?.length ?? 10}
            total={purchase?.items?.length ?? 0}
            setPageIndex={() => {}}
            setPageSize={() => {}}
          ></DataTable>

          <div className="border-1 my-4"></div>

          <DataTable
            columns={paymentColumns}
            data={transaction?.payments ?? []}
            pageIndex={0}
            pageSize={purchase?.items?.length ?? 10}
            total={purchase?.items?.length ?? 0}
            setPageIndex={() => {}}
            setPageSize={() => {}}
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
                <CardTitle className="border-b-2 pb-3">Order Summary</CardTitle>
              </CardHeader>

              <CardContent className="flex justify-between">
                <h1>Quantity: </h1>
                <p>{purchase?.quantity ?? 0}</p>
              </CardContent>

              <CardContent className="flex justify-between">
                <h1>Subtotal: </h1>
                <p>{purchase?.totalAmount ?? 0}</p>
              </CardContent>

              <CardContent className="flex justify-between">
                <h1>Discount: </h1>
                <p>{purchase?.discountAmount ?? 0}</p>
              </CardContent>

              <CardFooter className="flex justify-between border-t-2 pt-2 ">
                <h1 className="font-bold">Total: </h1>
                <p>{purchase?.finalAmount ?? 0}</p>
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
                <p>{transaction?.paidAmount}</p>
              </CardContent>

              <CardFooter className="flex justify-between border-t-2 pt-2">
                <h1 className="font-bold">Total: </h1>
                <p>{purchase?.finalAmount}</p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default PurchaseDetails;
