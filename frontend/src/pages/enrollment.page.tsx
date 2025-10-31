import type {
  EditEnrollmentFormType,
  EnrollmentType,
} from "@/components/schemas/enrollment.schema";
import api from "@/api/api";
import { toast } from "sonner";
import { useAuth } from "@/auth/useAuth";
import PageTitle from "@/components/Title";
import { useEffect, useState } from "react";
import { handleAxiosError } from "@/lib/utils";
import { DataTable } from "@/components/data-table";
import { useEditFormManager } from "@/hooks/use-custom-manager";
import EnrollmentModal from "@/components/modals/enrollment.modal";
import { useLoading } from "@/components/contexts/loading.context";
import { enrollmentColumns } from "@/components/columns/enrollment.column";
import { RequirePermission } from "@/components/commons/require-permission";

type EnrollmentProps = {
  customerId?: number;
  courseId?: number;
  isUseTitle?: boolean;
};

const Enrollment = ({
  customerId,
  courseId,
  isUseTitle = true,
}: EnrollmentProps) => {
  const { fetchPermissions } = useAuth();
  const { setLoading } = useLoading();

  const [data, setData] = useState<EnrollmentType[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  if (customerId !== undefined && courseId !== undefined) {
    throw new Error(
      "Enrollment component should receive only one of customerId or courseId, not both!"
    );
  }

  const { formManager, onEdit, onClose } = useEditFormManager<EnrollmentType>();

  const fetchData = async () => {
    try {
      let url = `/enrollments?page=${pageIndex}&limit=${pageSize}`;
      if (customerId)
        url = `/partners/customers/${customerId}/enrollments?page=${pageIndex}&limit=${pageSize}`;

      if (courseId)
        url = `/courses/${courseId}/enrollments?page=${pageIndex}&limit=${pageSize}`;

      const response = await api.get(url);

      setData(response.data.enrollments);
      setTotal(response.data.total);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleSubmit = async (formData: EditEnrollmentFormType) => {
    try {
      setLoading(true);

      const payload = {
        studentId: formData?.student?.id,
        note: formData?.note,
      };

      await api.patch(`/enrollments/${formManager?.data?.id}`, payload);
      toast.success("Edit enrollment success!");
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
      await api.delete(`/enrollments/${id}`);
      fetchData();
      toast.success("Enrollment is deleted!");
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
        await fetchPermissions(["enrollment"]);
        await fetchData();
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [pageIndex, pageSize]);

  return (
    <div className="p-4">
      {isUseTitle && <PageTitle title="Enrollment"></PageTitle>}
      <RequirePermission permission="enrollment:read">
        <DataTable
          onAdd={undefined}
          columns={enrollmentColumns({
            handleDelete,
            onEdit,
          })}
          data={data}
          total={total}
          pageIndex={pageIndex}
          pageSize={pageSize}
          setPageIndex={setPageIndex}
          setPageSize={setPageSize}
        />
      </RequirePermission>
      <EnrollmentModal
        formManager={formManager}
        handleSubmit={handleSubmit}
        onClose={onClose}
      ></EnrollmentModal>
    </div>
  );
};

export default Enrollment;
