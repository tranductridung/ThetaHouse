import api from "@/api/api";
import { useAuth } from "@/auth/useAuth";
import PageTitle from "@/components/Title";
import { useEffect, useState } from "react";
import { handleAxiosError } from "@/lib/utils";
import { DataTable } from "@/components/data-table";
import { itemColumns } from "@/components/columns/item.column";
import type { ItemType } from "@/components/schemas/item.schema";
import { useLoading } from "@/components/contexts/loading.context";
import { RequirePermission } from "@/components/commons/require-permission";

type ItemProps = { isUseTitle?: boolean };

const Item = ({ isUseTitle = true }: ItemProps) => {
  const { setLoading } = useLoading();
  const { fetchPermissions } = useAuth();

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
    const run = async () => {
      try {
        setLoading(true);
        await fetchPermissions(["item"]);
        await fetchData();
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [pageIndex, pageSize]);

  return (
    <div className="p-4">
      {isUseTitle && <PageTitle title="Item"></PageTitle>}
      <RequirePermission permission="item:read">
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
      </RequirePermission>
    </div>
  );
};

export default Item;
