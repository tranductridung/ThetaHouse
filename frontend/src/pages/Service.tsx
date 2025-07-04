import api from "@/api/api";
import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import type {
  CreateServiceFormType,
  EditServiceFormType,
  ServiceType,
} from "@/components/schemas/service";
import { serviceColumns } from "@/components/columns/service-column";
import ServiceForm from "@/components/forms/ServiceForm";
import { handleAxiosError } from "@/lib/utils";
import { toast } from "sonner";

export type FormManagerType = {
  isShow: boolean;
  type: "add" | "edit";
  data: ServiceType | null;
};

const Service = () => {
  const [data, setData] = useState<ServiceType[]>([]);
  const [formManager, setFormManager] = useState<FormManagerType>({
    isShow: false,
    type: "add",
    data: null,
  });
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const handleSubmit = async (
    formData: CreateServiceFormType | EditServiceFormType
  ) => {
    try {
      if (formManager.type === "add") {
        const response = await api.post("/services", formData);
        setData((prev) => [...prev, response.data.service]);
      } else if (formManager.type === "edit" && formManager.data?.id) {
        const response = await api.patch(
          `/services/${formManager.data.id}`,
          formData
        );
        setData((prev) =>
          prev.map((service) =>
            service.id === formManager.data?.id
              ? response.data.service
              : service
          )
        );
      }

      setFormManager({
        isShow: false,
        type: "add",
        data: null,
      });

      toast.success("Edit service success!");
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

  const onEdit = (service: ServiceType) => {
    setFormManager({
      isShow: true,
      type: "edit",
      data: service,
    });
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/services/${id}`);
      setData((prev) =>
        prev.map((service) =>
          service.id === id ? { ...service, status: "Deleted" } : service
        )
      );

      toast.success("Service is deleted!");
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await api.patch(`/services/${id}/restore`);
      setData((prev) =>
        prev.map((service) =>
          service.id === id ? { ...service, status: "Active" } : service
        )
      );
      toast.success("Service is restored!");
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await api.patch(`/services/${id}/toggle-status`);
      let newStatus = "";
      setData((prev) =>
        prev.map((service) => {
          if (service.id !== id) return service; // service not match

          // Change status
          if (service.status === "Active") {
            newStatus = "disabled";
            return { ...service, status: "Inactive" };
          }
          newStatus = "enabled";
          return { ...service, status: "Active" };
        })
      );
      toast.success(`Service is ${newStatus}!`);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  useEffect(() => {
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

    fetchData();
  }, [pageIndex, pageSize]);

  return (
    <div className="p-4">
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
          <ServiceForm
            serviceData={formManager.data}
            onSubmit={handleSubmit}
            type={formManager.type}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Service;
