import api from "@/api/api";
import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type {
  CreateProductType,
  EditProductType,
  ProductType,
} from "@/components/schemas/product";
import { productColumns } from "@/components/columns/product-column";
import ProductForm from "@/components/forms/ProductForm";
import { handleAxiosError, omitFields } from "@/lib/utils";
import { toast } from "sonner";

export type FormManagerType = {
  isShow: boolean;
  type: "add" | "edit";
  data: ProductType | null;
};

const Product = () => {
  const [data, setData] = useState<ProductType[]>([]);
  const [formManager, setFormManager] = useState<FormManagerType>({
    isShow: false,
    type: "add",
    data: null,
  });
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

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
    formData: CreateProductType | EditProductType
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
        toast.success("Edit product success!");
      }

      fetchData();
      setFormManager({ isShow: false, type: "add", data: null });
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const onAdd = () => {
    setFormManager({
      isShow: true,
      type: "add",
      data: null,
    });
  };

  const onEdit = (product: ProductType) => {
    setFormManager({
      isShow: true,
      type: "edit",
      data: product,
    });
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/products/${id}`);
      setData((prev) =>
        prev.map((product) =>
          product.id === id ? { ...product, status: "Deleted" } : product
        )
      );
      toast.success("Product is deleted!");
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      const response = await api.patch(`/products/${id}/restore`);
      console.log(response);
      setData((prev) =>
        prev.map((product) =>
          product.id === id ? { ...product, status: "Active" } : product
        )
      );
      toast.success("Product is restored!");
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await api.patch(`/products/${id}/toggle-status`);
      let newStatus = "";
      setData((prev) =>
        prev.map((product) => {
          if (product.id !== id) return product; // product not match

          if (product.status === "Active") {
            // Change status
            newStatus = "disabled";
            return { ...product, status: "Inactive" };
          }
          newStatus = "enabled";
          return { ...product, status: "Active" };
        })
      );
      toast.success(`Product is ${newStatus}!`);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize]);

  return (
    <div className="p-4">
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

      <Dialog
        open={formManager.isShow}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setFormManager({
              isShow: false,
              type: "add",
              data: null,
            });
          }
        }}
      >
        <DialogContent>
          <DialogTitle></DialogTitle>
          <ProductForm
            productData={formManager.data}
            onSubmit={handleSubmit}
            type={formManager.type}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Product;
