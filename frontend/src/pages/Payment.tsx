import api from "@/api/api";
import {
  paymentColumns,
  type PaymentType,
} from "@/components/columns/payment-column";
import { DataTable } from "@/components/data-table";

import { useEffect, useState } from "react";

const Payment = () => {
  const [data, setData] = useState<PaymentType[]>([]);

  const onAdd = () => {
    console.log("payment");
  };
  useEffect(() => {
    const fetchData = async () => {
      const response = await api.get("/payments");
      setData(response.data.payments);
    };
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <DataTable columns={paymentColumns} data={data} onAdd={onAdd} />
    </div>
  );
};

export default Payment;
