import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import type {
  CreateDiscountFormType,
  EditDiscountFormType,
  DiscountType,
} from "@/components/schemas/discount";
import { discountColumns } from "@/components/columns/discount-column";
import DiscountForm from "@/components/forms/DiscountForm";
import api from "@/api/api";
import { DataTable } from "@/components/data-table";
import { handleAxiosError } from "@/lib/utils";
import { toast } from "sonner";

export type FormManagerType = {
  isShow: boolean;
  type: "add" | "edit";
  data: DiscountType | null;
};

const Discount = () => {
  const [data, setData] = useState<DiscountType[]>([]);
  const [formManager, setFormManager] = useState<FormManagerType>({
    isShow: false,
    type: "add",
    data: null,
  });
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const handleSubmit = async (
    formData: CreateDiscountFormType | EditDiscountFormType
  ) => {
    try {
      if (formManager.type === "add") {
        const response = await api.post("/discounts", formData);
        setData((prev) => [...prev, response.data.discount]);
      } else if (formManager.type === "edit" && formManager.data?.id) {
        const response = await api.patch(
          `/discounts/${formManager.data.id}`,
          formData
        );
        setData((prev) =>
          prev.map((discount) =>
            discount.id === formManager.data?.id
              ? response.data.discount
              : discount
          )
        );
      }
      setFormManager({
        isShow: false,
        type: "add",
        data: null,
      });
      toast.success("Edit success!");
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

  const onEdit = (discount: DiscountType) => {
    setFormManager({
      isShow: true,
      type: "edit",
      data: discount,
    });
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/discounts/${id}`);
      setData((prev) =>
        prev.map((discount) =>
          discount.id === id ? { ...discount, status: "Deleted" } : discount
        )
      );
      toast.success("Discount id deleted!");
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      const response = await api.patch(`/discounts/${id}/restore`);
      console.log(response);
      setData((prev) =>
        prev.map((discount) =>
          discount.id === id ? { ...discount, status: "Active" } : discount
        )
      );
      toast.success("Discount is restored!");
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await api.patch(`/discounts/${id}/toggle-status`);
      let newStatus = "";

      setData((prev) =>
        prev.map((discount) => {
          if (discount.id !== id) return discount; // discount not match

          newStatus = discount.status === "Active" ? "disable" : "enable";
          if (discount.status === "Active")
            // Change status
            return { ...discount, status: "Inactive" };
          return { ...discount, status: "Active" };
        })
      );
      toast.success(`Discount is ${newStatus}`);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(
          `/discounts/all?page=${pageIndex}&limit=${pageSize}`
        );
        setData(response.data.discounts);
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
        onAdd={onAdd}
        columns={discountColumns({
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
          <DiscountForm
            discountData={formManager.data}
            onSubmit={handleSubmit}
            type={formManager.type}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Discount;
