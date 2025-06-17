import api from "@/api/api";
import { itemColumns } from "@/components/columns/item-column";
import { DataTable } from "@/components/data-table";
import type { ItemType } from "@/components/schemas/item";
import { handleAxiosError } from "@/lib/utils";
import { useEffect, useState } from "react";

const Item = () => {
  const [data, setData] = useState<ItemType[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const onAdd = () => {
    console.log("item");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(
          `/items?page=${pageIndex}&limit=${pageSize}`
        );
        setData(response.data.items);
        setTotal(response.data.total);
      } catch (error) {
        handleAxiosError(error);
      }
    };

    fetchData();
  }, [pageIndex, pageSize]);

  return (
    <div className="p-4">
      <DataTable
        columns={itemColumns}
        data={data}
        onAdd={onAdd}
        total={total}
        pageIndex={pageIndex}
        pageSize={pageSize}
        setPageIndex={setPageIndex}
        setPageSize={setPageSize}
      />
    </div>
  );
};

export default Item;
