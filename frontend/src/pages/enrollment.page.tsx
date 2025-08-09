import api from "@/api/api";
import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import type {
  EditEnrollmentFormType,
  EnrollmentType,
} from "@/components/schemas/enrollment.schema";
import { enrollmentColumns } from "@/components/columns/enrollment.column";
import { handleAxiosError } from "@/lib/utils";
import { toast } from "sonner";
import PageTitle from "@/components/Title";
import { useEditFormManager } from "@/hooks/use-custom-manager";
import EnrollmentModal from "@/components/modals/enrollment.modal";

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
    const payload = {
      studentId: formData?.student?.id,
      note: formData?.note,
    };

    try {
      await api.patch(`/enrollments/${formManager?.data?.id}`, payload);
      toast.success("Edit enrollment success!");
      fetchData();
      onClose();
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/enrollments/${id}`);
      fetchData();
      toast.success("Enrollment is deleted!");
    } catch (error) {
      handleAxiosError(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize]);

  return (
    <div className="p-4">
      {isUseTitle && <PageTitle title="Enrollment"></PageTitle>}

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

      <EnrollmentModal
        formManager={formManager}
        handleSubmit={handleSubmit}
        onClose={onClose}
      ></EnrollmentModal>
    </div>
  );
};

export default Enrollment;
