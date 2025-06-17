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
import type { ConsignmentDetailType } from "@/components/schemas/sourceDetail";
import { DataTable } from "@/components/data-table";
import { itemColumns } from "@/components/columns/item-column";
import { paymentColumns } from "@/components/columns/payment-column";
import { getTransactionStatusStyle } from "@/components/styles/TransactionStatus";
import { getSourceStatusStyle } from "@/components/styles/SourceStatus";
import type { TransactionType } from "@/components/schemas/transaction";
import DisplayUser from "@/components/DisplayUser";

const ConsignmentDetails = () => {
  const { id } = useParams();
  const [consignment, setConsignment] = useState<ConsignmentDetailType | null>(
    null
  );

  const [transactions, setTransactions] = useState<TransactionType | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const consignmentReponse = await api.get(`/consignments/${id}`);
        setConsignment(consignmentReponse.data.consignment);

        const transactionReponse = await api.get(
          `/transactions/consignments/${id}`
        );
        setTransactions(transactionReponse.data.transaction);
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

  console.log("consignment: ", consignment);
  console.log("transaction: ", transactions);
  return (
    <>
      <div className="p-4">
        <div className="flex pb-3 space-x-5">
          <h1 className="text-2xl font-bold">Consignment ID: {id}</h1>
          <h1
            className={`flex  px-5 py-1 rounded-xl font-bold ${getTransactionStatusStyle(
              transactions?.status
            )}`}
          >
            {transactions?.status}
          </h1>

          <h1
            className={`flex  px-5 py-1 rounded-xl font-bold ${getSourceStatusStyle(
              consignment?.status
            )}`}
          >
            {consignment?.status}
          </h1>
        </div>

        <div className="flex flex-col space-y-5">
          <DataTable
            columns={filteredColumns}
            data={consignment?.items ?? []}
          ></DataTable>

          <div className="bconsignment-1 my-4"></div>

          <DataTable
            columns={paymentColumns}
            data={transaction?.payments ?? []}
          ></DataTable>
        </div>

        <div className="bconsignment-1 my-4"></div>

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
                <CardTitle className="border-b-2 pb-3">Order Summary</CardTitle>
              </CardHeader>

              <CardContent className="flex justify-between">
                <h1>Quantity: </h1>
                <p>{consignment?.quantity ?? 0}</p>
              </CardContent>

              <CardContent className="flex justify-between">
                <h1>Subtotal: </h1>
                <p>{consignment?.totalAmount ?? 0}</p>
              </CardContent>

              <CardContent className="flex justify-between">
                <h1>Commission Rate: </h1>
                <p>{consignment?.commissionRate ?? 0}</p>
              </CardContent>

              <CardFooter className="flex justify-between border-t-2 pt-2 ">
                <h1 className="font-bold">Total: </h1>
                <p>{consignment?.finalAmount ?? 0}</p>
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
                <p>{consignment?.finalAmount}</p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConsignmentDetails;
