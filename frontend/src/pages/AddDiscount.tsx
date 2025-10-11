import { useEffect, useState } from "react";
import { addDiscountColumns } from "@/components/columns/add-discount.column";
import { DataTable } from "@/components/data-table";
import type { DiscountType } from "@/components/schemas/discount.schema";
import { handleAxiosError } from "@/lib/utils";
import api from "@/api/api";
import { useLoading } from "@/components/contexts/loading.context";
import { useAuth } from "@/auth/useAuth";
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
        await fetchPermissions("discount");
        await fetchData();
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [pageIndex, pageSize]);

  console.log(data);
  return (
    <div className="w-fit max-w-screen-md overflow-x-auto">
      <DataTable
        onAdd={undefined}
        columns={addDiscountColumns({
          handleAddDiscount,
          itemId,
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
export default AddDiscount;
