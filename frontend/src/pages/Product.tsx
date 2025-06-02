import api from "@/api/api";
import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import type {
  ProductFormType,
  ProductType,
} from "@/components/schemas/product";
import { productColumns } from "@/components/columns/product-column";
import ProductForm from "@/components/forms/ProductForm";
import { handleAxiosError } from "@/lib/utils";
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

  const handleSubmit = async (formData: ProductFormType) => {
    try {
      if (formManager.type === "add") {
        const response = await api.post("/products", formData);
        setData((prev) => [...prev, response.data.product]);
      } else if (formManager.type === "edit" && formManager.data?.id) {
        const response = await api.patch(
          `/products/${formManager.data.id}`,
          formData
        );
        setData((prev) =>
          prev.map((product) =>
            product.id === formManager.data?.id
              ? response.data.product
              : product
          )
        );
      }

      setFormManager({
        isShow: false,
        type: "add",
        data: null,
      });
    } catch (error) {
      console.error(error);
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
    const fetchData = async () => {
      const response = await api.get("/products");
      setData(response.data.products);
    };
    fetchData();
  }, []);

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
