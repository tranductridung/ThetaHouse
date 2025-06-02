import api from "@/api/api";
import { transactionColumns } from "@/components/columns/transaction-column";
import { DataTable } from "@/components/data-table";
import type { TransactionType } from "@/components/schemas/transaction";

import { useEffect, useState } from "react";

const Transaction = () => {
  const [data, setData] = useState<TransactionType[]>([]);

  const onAdd = () => {
    console.log("transaction");
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await api.get("/transactions");
      setData(response.data.transactions);
    };
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <DataTable columns={transactionColumns} data={data} onAdd={onAdd} />
    </div>
  );
};

export default Transaction;
