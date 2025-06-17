import { DataTable } from "@/components/data-table";
import type { TransactionType } from "./schemas/transaction";
import { chooseTransactionColumns } from "./columns/choose-transaction";
import api from "@/api/api";
import { handleAxiosError } from "@/lib/utils";
import { useEffect, useState } from "react";
type ChooseTransactionProps = {
  handleChooseTransaction: (transaction: TransactionType) => void;
};

const ChooseTransaction = ({
  handleChooseTransaction,
}: ChooseTransactionProps) => {
  const [data, setData] = useState<TransactionType[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(
          `/transactions?page=${pageIndex}&limit=${pageSize}`
        );
        setData(response.data.transactions);
        setTotal(response.data.total);
      } catch (error) {
        handleAxiosError(error);
      }
    };

    fetchData();
  }, [pageIndex, pageSize]);

  return (
    <div>
      <DataTable
        onAdd={undefined}
        columns={chooseTransactionColumns({
          handleChooseTransaction,
        })}
        data={data}
        total={total}
        pageIndex={pageIndex}
        pageSize={pageSize}
        setPageIndex={setPageIndex}
        setPageSize={setPageSize}
      />
    </div>
  );
};
export default ChooseTransaction;
