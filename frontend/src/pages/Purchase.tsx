import { useEffect, useState } from "react";
import type { PurchaseType } from "@/components/schemas/source";
import api from "@/api/api";
import { DataTable } from "@/components/data-table";
import { useNavigate } from "react-router-dom";
import { purchaseColumns } from "@/components/columns/purchase-column";
import { handleAxiosError } from "@/lib/utils";
import { useSourceActions } from "@/hooks/useSourceAction";

type PurchaseProps = { supplierId?: number };
const Purchase = ({ supplierId }: PurchaseProps) => {
  const [data, setData] = useState<PurchaseType[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const url = supplierId
        ? `/partners/suppliers/${supplierId}/purchases?page=${pageIndex}&limit=${pageSize}`
        : `/purchases/all?page=${pageIndex}&limit=${pageSize}`;

      const response = await api.get(url);

      setData(response.data.purchases);
      setTotal(response.data.total);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const { handleExportImport } = useSourceActions(fetchData);

  const onImport = async (id: number) => {
    handleExportImport(id, "Purchase");
  };

  const onAdd = () => {
    navigate("/sources/purchases/create");
  };

  const onDetail = (id: number) => {
    navigate(`/sources/purchases/${id}`);
  };

  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize]);

  return (
    <div className="p-4">
      <DataTable
        onAdd={onAdd}
        columns={purchaseColumns({
          onDetail,
          onImport,
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

export default Purchase;
