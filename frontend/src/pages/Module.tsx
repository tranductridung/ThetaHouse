import api from "@/api/api";
import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import type {
  CreateModuleFormType,
  EditModuleFormType,
  ModuleType,
} from "@/components/schemas/module";
import { moduleColumns } from "@/components/columns/module-column";
import ModuleForm from "@/components/forms/ModuleForm";
import { toast } from "sonner";
import { handleAxiosError } from "@/lib/utils";

export type FormManagerType = {
  isShow: boolean;
  type: "add" | "edit";
  data: ModuleType | null;
};

const Module = () => {
  const [data, setData] = useState<ModuleType[]>([]);
  const [formManager, setFormManager] = useState<FormManagerType>({
    isShow: false,
    type: "add",
    data: null,
  });

  const handleSubmit = async (
    formData: CreateModuleFormType | EditModuleFormType
  ) => {
    try {
      if (formManager.type === "add") {
        const response = await api.post("/modules", formData);
        setData((prev) => [...prev, response.data.module]);
        toast.success(`Create module success!`);
      } else if (formManager.type === "edit" && formManager.data?.id) {
        const response = await api.patch(
          `/modules/${formManager.data.id}`,
          formData
        );
        setData((prev) =>
          prev.map((module) =>
            module.id === formManager.data?.id ? response.data.module : module
          )
        );
        toast.success(`Edit module success!`);
      }

      setFormManager({
        isShow: false,
        type: "add",
        data: null,
      });
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

  const onEdit = (module: ModuleType) => {
    setFormManager({
      isShow: true,
      type: "edit",
      data: module,
    });
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/modules/${id}`);
      setData((prev) =>
        prev.map((module) =>
          module.id === id ? { ...module, status: "Deleted" } : module
        )
      );
      toast.success("Module is deleted!");
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await api.patch(`/modules/${id}/restore`);
      setData((prev) =>
        prev.map((module) =>
          module.id === id ? { ...module, status: "Active" } : module
        )
      );
      toast.success("Module is restored!");
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await api.patch(`/modules/${id}/toggle-status`);
      let newStatus = "";

      setData((prev) =>
        prev.map((module) => {
          if (module.id !== id) return module; // module not match

          if (module.status === "Active") {
            newStatus = "disabled";
            return { ...module, status: "Inactive" };
          }
          newStatus = "enabled";
          return { ...module, status: "Inactive" };
        })
      );
      toast.success(`Module is ${newStatus}`);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await api.get("/modules");
      setData(response.data.modules);
    };
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <DataTable
        onAdd={onAdd}
        columns={moduleColumns({
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
          <ModuleForm
            moduleData={formManager.data}
            onSubmit={handleSubmit}
            type={formManager.type}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Module;
