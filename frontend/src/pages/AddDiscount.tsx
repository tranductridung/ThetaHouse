import api from "@/api/api";
import { useAuth } from "@/auth/useAuth";
import { useEffect, useState } from "react";
import { handleAxiosError } from "@/lib/utils";
import { DataTable } from "@/components/data-table";
import { useLoading } from "@/components/contexts/loading.context";
import type { DiscountType } from "@/components/schemas/discount.schema";
import { RequirePermission } from "@/components/commons/require-permission";
import { addDiscountColumns } from "@/components/columns/add-discount.column";

type AddDiscountProps = {
  handleAddDiscount: (discount: DiscountType, itemId?: number) => void;
  itemId?: number;
};

const AddDiscount = ({ handleAddDiscount, itemId }: AddDiscountProps) => {
  const { setLoading } = useLoading();
  const { fetchPermissions } = useAuth();

  const [data, setData] = useState<DiscountType[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchData = async () => {
    try {
      const response = await api.get(
        `/discounts?page=${pageIndex}&limit=${pageSize}`
      );
      setData(response.data.discounts);
      setTotal(response.data.total);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        await fetchPermissions(["discount"]);
        await fetchData();
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [pageIndex, pageSize]);

  return (
    <div className="w-fit max-w-screen-md overflow-x-auto">
      <RequirePermission permission="discount:read">
        <DataTable
          columns={addDiscountColumns({ handleAddDiscount, itemId })}
          data={data}
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
export default AddDiscount;
