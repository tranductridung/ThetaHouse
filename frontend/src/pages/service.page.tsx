import type {
  CreateServiceFormType,
  EditServiceFormType,
  ServiceType,
} from "@/components/schemas/service.schema";
import api from "@/api/api";
import { toast } from "sonner";
import PageTitle from "@/components/Title";
import { useEffect, useState } from "react";
import { handleAxiosError } from "@/lib/utils";
import { DataTable } from "@/components/data-table";
import ServiceModal from "@/components/modals/service.modal";
import { useCombineFormManager } from "@/hooks/use-custom-manager";
import { serviceColumns } from "@/components/columns/service.column";
import { useLoading } from "@/components/contexts/loading.context";
import { useAuth } from "@/auth/useAuth";

type ServiceProps = {
  isUseTitle?: boolean;
};
const Service = ({ isUseTitle }: ServiceProps) => {
  const { setLoading } = useLoading();
  const { fetchPermissions } = useAuth();

  const [data, setData] = useState<ServiceType[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const { formManager, onAdd, onEdit, onClose } =
    useCombineFormManager<ServiceType>();

  const fetchData = async () => {
    try {
      const response = await api.get(
        `/services/all?page=${pageIndex}&limit=${pageSize}`
      );
      setData(response.data.services);
      setTotal(response.data.total);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleSubmit = async (
    formData: CreateServiceFormType | EditServiceFormType
  ) => {
    try {
      if (formManager.type === "add") {
        await api.post("/services", formData);
        fetchData();
      } else if (formManager.type === "edit" && formManager.data?.id) {
        await api.patch(`/services/${formManager.data.id}`, formData);
        fetchData();
      }
      onClose();
      toast.success("Edit service success!");
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/services/${id}`);
      fetchData();
      toast.success("Service is deleted!");
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await api.patch(`/services/${id}/restore`);
      fetchData();
      toast.success("Service is restored!");
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await api.patch(`/services/${id}/toggle-status`);
      fetchData();
      toast.success(`Service status is toggle!`);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        await fetchPermissions("service");
        await fetchData();
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [pageIndex, pageSize]);
  return (
    <div className="p-4">
      {isUseTitle && <PageTitle title="Service"></PageTitle>}

      <DataTable
        onAdd={onAdd}
        columns={serviceColumns({
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

      <ServiceModal
        formManager={formManager}
        onClose={onClose}
        handleSubmit={handleSubmit}
      ></ServiceModal>
    </div>
  );
};

export default Service;
