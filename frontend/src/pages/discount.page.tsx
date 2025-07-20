import { useEffect, useState } from "react";
import type {
  CreateDiscountFormType,
  EditDiscountFormType,
  DiscountType,
} from "@/components/schemas/discount.schema";
import { discountColumns } from "@/components/columns/discount.column";
import api from "@/api/api";
import { DataTable } from "@/components/data-table";
import { handleAxiosError } from "@/lib/utils";
import { toast } from "sonner";
import PageTitle from "@/components/Title";
import { useCombineFormManager } from "@/hooks/use-custom-manager";
import DiscountModal from "@/components/modals/discount.modal";

type DiscountProps = { isUseTitle?: boolean };

const Discount = ({ isUseTitle = true }: DiscountProps) => {
  const [data, setData] = useState<DiscountType[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const { formManager, onAdd, onEdit, onClose } =
    useCombineFormManager<DiscountType>();

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

  const handleSubmit = async (
    formData: CreateDiscountFormType | EditDiscountFormType
  ) => {
    try {
      if (formManager.type === "add") {
        await api.post("/discounts", formData);
        fetchData();
      } else if (formManager.type === "edit" && formManager.data?.id) {
        await api.patch(`/discounts/${formManager.data.id}`, formData);

        fetchData();
      }
      onClose();
      toast.success("Edit success!");
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/discounts/${id}`);
      fetchData();
      toast.success("Discount id deleted!");
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await api.patch(`/discounts/${id}/restore`);
      fetchData();

      toast.success("Discount is restored!");
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      const response = await api.patch(`/discounts/${id}/toggle-status`);
      fetchData();

      toast.success(response.data.message);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize]);

  return (
    <div className="p-4">
      {isUseTitle && <PageTitle title="Discount"></PageTitle>}
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

      <DiscountModal
        formManager={formManager}
        onClose={onClose}
        handleSubmit={handleSubmit}
      ></DiscountModal>
    </div>
  );
};

export default Discount;
