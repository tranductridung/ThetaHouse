import api from "@/api/api";
import { handleAxiosError } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { OrderDetailType } from "@/components/schemas/sourceDetail";
import { DataTable } from "@/components/data-table";
import { itemColumns } from "@/components/columns/item-column";
import { Mail, Phone, User } from "lucide-react";
import { paymentColumns } from "@/components/columns/payment-column";

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<OrderDetailType | null>(null);
  const [transaction, setTransaction] = useState(null);

  useEffect(() => {
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

    fetchData();
  }, []);

  console.log("order: ", order);
  console.log("transaction: ", transaction);
  return (
    <>
      <div className="p-4">
        <div className="flex pb-3 space-x-5">
          <h1 className="text-2xl font-bold">Order ID: {id}</h1>
          <h1
            className={`flex  px-5 py-1 rounded-xl font-bold ${
              transaction?.status === "Paid"
                ? "bg-green-200 text-green-600"
                : transaction?.status === "Unpaid"
                ? "bg-red-200 text-red-600"
                : "bg-amber-200 text-amber-600"
            }`}
          >
            {transaction?.status}
          </h1>
        </div>

        <div className="flex flex-col space-y-5">
          <DataTable
            columns={itemColumns}
            data={order?.items ?? []}
          ></DataTable>

          <div className="border-1 my-4"></div>

          <DataTable
            columns={paymentColumns}
            data={transaction?.payments ?? []}
          ></DataTable>
        </div>

        <div className="border-1 my-4"></div>

        <div className="flex flex-1 flex-col md:flex-row pt-5 rounded-xl text-gray-500 shadow-xl text-md md:text-xl ">
          <div className="flex-1/3 grid md:grid-rows-3 p-5">
            <div className="flex flex-col py-3 space-y-3 w-full border-b-2">
              <h1 className="font-bold text-black">Customer</h1>
              <div className="flex flex-row space-x-3">
                <User />
                <span>{order?.customer.fullName}</span>
              </div>

              <div className="flex flex-row space-x-3">
                <Mail /> <span>{order?.customer.email}</span>
              </div>
              <div className="flex flex-row space-x-3">
                <Phone />
                <span>{order?.customer.phoneNumber}</span>
              </div>
            </div>

            <div className="flex flex-col py-3 space-y-3 w-full border-b-2">
              <h1 className="font-bold text-black">Creator</h1>
              <div className="flex flex-row space-x-3">
                <User />
                <span>{order?.creator.fullName}</span>
              </div>

              <div className="flex flex-row space-x-3">
                <Mail /> <span>{order?.creator.email}</span>
              </div>
              <div className="flex flex-row space-x-3">
                <Phone />
                <span>{order?.creator.phoneNumber}</span>
              </div>
            </div>

            <div className="py-3 w-full border-b-2">
              <h1 className="font-bold text-black">Note</h1>
              <span>{order?.note ?? "No note"}</span>
            </div>
          </div>

          <div className="flex flex-1/3 flex-col p-5 space-y-5">
            <h1 className="font-bold text-black">Order Summary</h1>
            <div className="flex flex-row justify-between">
              <h1>Items: </h1>
              <p>{order?.items.length}</p>
            </div>

            <div className="flex flex-row justify-between">
              <h1>Quantity: </h1>
              <p>{order?.quantity}</p>
            </div>

            <div className="flex flex-row justify-between ">
              <h1>Subtotal: </h1>
              <p>{order?.totalAmount}</p>
            </div>

            <div className="flex flex-row justify-between">
              <h1>Discount: </h1>
              <p>{order?.discount ?? "No Discount"}</p>
            </div>

            <div className="flex flex-row justify-between font-bold border-t-2 text-black">
              <h1>Total: </h1>
              <p>{order?.finalAmount}</p>
            </div>
          </div>

          <div className="flex flex-1/3 flex-col p-5 space-y-5">
            <h1 className="font-bold text-black">Payment Summary</h1>

            <div className="flex flex-row justify-between ">
              <h1>Paid: </h1>
              <p>{transaction?.paidAmount}</p>
            </div>

            <div className="flex flex-row justify-between font-bold border-t-2 text-black">
              <h1 className="">Total: </h1>
              <p>{order?.finalAmount}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetails;
