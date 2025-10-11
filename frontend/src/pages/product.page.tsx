import api from "@/api/api";
import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import type {
  CreateProductFormType,
  EditProductFormType,
  ProductType,
} from "@/components/schemas/product.schema";
import { productColumns } from "@/components/columns/product.column";
import { handleAxiosError, omitFields } from "@/lib/utils";
import { toast } from "sonner";
import PageTitle from "@/components/Title";
import { useCombineFormManager } from "@/hooks/use-custom-manager";
import ProductModal from "@/components/modals/product.modal";
import { useAuth } from "@/auth/useAuth";
import { useLoading } from "@/components/contexts/loading.context";

type ProductProps = {
  isUseTitle?: boolean;
};
const Product = ({ isUseTitle = true }: ProductProps) => {
  const { setLoading } = useLoading();
  const { fetchPermissions } = useAuth();

  const [data, setData] = useState<ProductType[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const { formManager, onAdd, onEdit, onClose } =
    useCombineFormManager<ProductType>();

  const fetchData = async () => {
    try {
      const response = await api.get(
        `/products/all?page=${pageIndex}&limit=${pageSize}`
      );
      setData(response.data.products);
      setTotal(response.data.total);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleSubmit = async (
    formData: CreateProductFormType | EditProductFormType
  ) => {
    try {
      if (formManager.type === "add") {
        await api.post("/products", formData);
        toast.success("Add product success!");
      } else if (formManager.type === "edit" && formManager.data?.id) {
        const excludeFields = formData.useBaseQuantityPricing
          ? [
              "defaultOrderPrice",
              "defaultPurchasePrice",
              "useBaseQuantityPricing",
            ]
          : [
              "baseQuantityPerUnit",
              "orderPricePerBaseQuantity",
              "purchasePricePerBaseQuantity",
              "useBaseQuantityPricing",
            ];

        const payload = omitFields(
          formData,
          excludeFields as (keyof typeof formData)[]
        );

        await api.patch(`/products/${formManager.data.id}`, payload);
        console.log("payloadddddd", payload);
        toast.success("Edit product success!");
      }

      fetchData();
      onClose();
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/products/${id}`);
      fetchData();
      toast.success("Product is deleted!");
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await api.patch(`/products/${id}/restore`);
      fetchData();
      toast.success("Product is restored!");
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      const response = await api.patch(`/products/${id}/toggle-status`);
      fetchData();

      toast.success(response.data.message);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        await fetchPermissions("product");
        await fetchData();
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [pageIndex, pageSize]);

  return (
    <div className="p-4">
      {isUseTitle && <PageTitle title="Product"></PageTitle>}

      <DataTable
        onAdd={onAdd}
        columns={productColumns({
          handleDelete,
          handleRestore,
          handleToggle,
          onEdit,
        })}
        data={data}
        total={total}
        pageIndex={pageIndex}
        pageSize={pageSize}
        setPageIndex={setPageIndex}
        setPageSize={setPageSize}
      />

      <ProductModal
        formManager={formManager}
        onClose={onClose}
        handleSubmit={handleSubmit}
      ></ProductModal>
    </div>
  );
};

export default Product;
