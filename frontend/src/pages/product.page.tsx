import type {
  CreateProductFormType,
  EditProductFormType,
  ProductType,
} from "@/components/schemas/product.schema";
import api from "@/api/api";
import { toast } from "sonner";
import { useAuth } from "@/auth/useAuth";
import PageTitle from "@/components/Title";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { handleAxiosError, omitFields } from "@/lib/utils";
import ProductModal from "@/components/modals/product.modal";
import { useCombineFormManager } from "@/hooks/use-custom-manager";
import { useLoading } from "@/components/contexts/loading.context";
import { productColumns } from "@/components/columns/product.column";
import { RequirePermission } from "@/components/commons/require-permission";

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
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await api.delete(`/products/${id}`);
      fetchData();
      toast.success("Product is deleted!");
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      setLoading(true);

      await api.patch(`/products/${id}/restore`);
      fetchData();
      toast.success("Product is restored!");
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      setLoading(true);
      const response = await api.patch(`/products/${id}/toggle-status`);
      fetchData();

      toast.success(response.data.message);
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        await fetchPermissions(["product"]);
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
      <RequirePermission permission="product:read">
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
          permission={"product:create"}
        />
      </RequirePermission>

      <ProductModal
        formManager={formManager}
        onClose={onClose}
        handleSubmit={handleSubmit}
      ></ProductModal>
    </div>
  );
};

export default Product;
