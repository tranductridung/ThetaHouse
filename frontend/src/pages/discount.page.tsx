import type {
  CreateDiscountFormType,
  EditDiscountFormType,
  DiscountType,
} from "@/components/schemas/discount.schema";
import api from "@/api/api";
import { toast } from "sonner";
import { useAuth } from "@/auth/useAuth";
import PageTitle from "@/components/Title";
import { useEffect, useState } from "react";
import { handleAxiosError } from "@/lib/utils";
import { DataTable } from "@/components/data-table";
import DiscountModal from "@/components/modals/discount.modal";
import { useCombineFormManager } from "@/hooks/use-custom-manager";
import { useLoading } from "@/components/contexts/loading.context";
import { discountColumns } from "@/components/columns/discount.column";
import { RequirePermission } from "@/components/commons/require-permission";

type DiscountProps = { isUseTitle?: boolean };

const Discount = ({ isUseTitle = true }: DiscountProps) => {
  const { fetchPermissions } = useAuth();
  const { setLoading } = useLoading();

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
      setLoading(true);
      if (formManager.type === "add") await api.post("/discounts", formData);
      else if (formManager.type === "edit" && formManager.data?.id)
        await api.patch(`/discounts/${formManager.data.id}`, formData);

      fetchData();
      onClose();
      toast.success("Edit success!");
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setLoading(false);
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
    <div className="p-4">
      {isUseTitle && <PageTitle title="Discount"></PageTitle>}
      <RequirePermission permission="discount:read">
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
          permission={"discount:create"}
        />
      </RequirePermission>

      <DiscountModal
        formManager={formManager}
        onClose={onClose}
        handleSubmit={handleSubmit}
      ></DiscountModal>
    </div>
  );
};

export default Discount;
