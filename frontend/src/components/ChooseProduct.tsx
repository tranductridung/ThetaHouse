import api from "@/api/api";
import { addProductColumns } from "@/components/columns/add-product.column";
import { DataTable } from "@/components/data-table";
import type { ProductType } from "@/components/schemas/product.schema";
import { handleAxiosError } from "@/lib/utils";
import { useEffect, useState } from "react";

type ChooseProductProps = {
  handleAddProduct: (product: ProductType) => void;
};

const ChooseProduct = ({ handleAddProduct }: ChooseProductProps) => {
  const [data, setData] = useState<ProductType[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    try {
      const fetchData = async () => {
        const response = await api.get(
          `/products?page=${pageIndex}&limit=${pageSize}`
        );
        setData(response.data.products);
        setTotal(response.data.total);
      };
      fetchData();
    } catch (error) {
      handleAxiosError(error);
    }
  }, [pageIndex, pageSize]);

  return (
    <div>
      <DataTable
        onAdd={undefined}
        columns={addProductColumns({
          handleAddProduct,
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
export default ChooseProduct;
