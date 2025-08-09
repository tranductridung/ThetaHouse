import api from "@/api/api";
import { itemColumns } from "@/components/columns/item.column";
import { DataTable } from "@/components/data-table";
import type { ItemType } from "@/components/schemas/item.schema";
import PageTitle from "@/components/Title";
import { handleAxiosError } from "@/lib/utils";
import { useEffect, useState } from "react";

type ItemProps = { isUseTitle?: boolean };

const Item = ({ isUseTitle = true }: ItemProps) => {
  const [data, setData] = useState<ItemType[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

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

  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize]);

  return (
    <div className="p-4">
      {isUseTitle && <PageTitle title="Item"></PageTitle>}

      <DataTable
        columns={itemColumns({
          hasAction: false,
        })}
        data={data}
        onAdd={undefined}
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
