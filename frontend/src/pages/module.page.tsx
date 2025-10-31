import type {
  CreateModuleFormType,
  EditModuleFormType,
  ModuleType,
} from "@/components/schemas/module.schema";
import api from "@/api/api";
import { toast } from "sonner";
import { useAuth } from "@/auth/useAuth";
import PageTitle from "@/components/Title";
import { useEffect, useState } from "react";
import { handleAxiosError } from "@/lib/utils";
import { DataTable } from "@/components/data-table";
import ModuleModal from "@/components/modals/module.modal";
import { useCombineFormManager } from "@/hooks/use-custom-manager";
import { moduleColumns } from "@/components/columns/module.column";
import { useLoading } from "@/components/contexts/loading.context";
import { RequirePermission } from "@/components/commons/require-permission";

type ModuleProps = { isUseTitle?: boolean };

const Module = ({ isUseTitle = true }: ModuleProps) => {
  const { setLoading } = useLoading();
  const { fetchPermissions } = useAuth();

  const [data, setData] = useState<ModuleType[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const { formManager, onAdd, onEdit, onClose } =
    useCombineFormManager<ModuleType>();

  const fetchData = async () => {
    try {
      const response = await api.get(
        `/modules/all?page=${pageIndex}&limit=${pageSize}`
      );
      setData(response.data.modules);
      setTotal(response.data.total);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleSubmit = async (
    formData: CreateModuleFormType | EditModuleFormType
  ) => {
    try {
      setLoading(true);
      if (formManager.type === "add") {
        await api.post("/modules", formData);
        toast.success(`Create module success!`);
      } else if (formManager.type === "edit" && formManager.data?.id) {
        await api.patch(`/modules/${formManager.data.id}`, formData);
        toast.success(`Edit module success!`);
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
      await api.delete(`/modules/${id}`);
      fetchData();
      toast.success("Module is deleted!");
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      setLoading(true);
      await api.patch(`/modules/${id}/restore`);
      fetchData();
      toast.success("Module is restored!");
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      setLoading(true);
      const response = await api.patch(`/modules/${id}/toggle-status`);
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
        await fetchPermissions(["module"]);
        await fetchData();
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [pageIndex, pageSize]);
  return (
    <div className="p-4">
      {isUseTitle && <PageTitle title="Module"></PageTitle>}
      <RequirePermission permission="module:read">
        <DataTable
          onAdd={onAdd}
          columns={moduleColumns({
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
          permission={"module:create"}
        />
      </RequirePermission>

      <ModuleModal
        formManager={formManager}
        onClose={onClose}
        handleSubmit={handleSubmit}
      ></ModuleModal>
    </div>
  );
};

export default Module;
