import api from "@/api/api";
import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import type {
  CourseFormType,
  CourseType,
} from "@/components/schemas/course.schema";
import { courseColumns } from "@/components/columns/course.column";
import { handleAxiosError } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import PageTitle from "@/components/Title";
import { useCombineFormManager } from "@/hooks/use-custom-manager";
import CourseModal from "@/components/modals/course.modal";

type CourseProps = { isUseTitle?: boolean };

const Course = ({ isUseTitle = true }: CourseProps) => {
  const [data, setData] = useState<CourseType[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const { formManager, onAdd, onEdit, onClose } =
    useCombineFormManager<CourseType>();

  const fetchData = async () => {
    try {
      const response = await api.get(
        `/courses/all?page=${pageIndex}&limit=${pageSize}`
      );

      setData(response.data.courses);
      setTotal(response.data.total);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleSubmit = async (formData: CourseFormType) => {
    try {
      if (formManager.type === "add") {
        await api.post("/courses", formData);
        toast.success("Add course success!");
      } else if (formManager.type === "edit" && formManager.data?.id) {
        await api.patch(`/courses/${formManager.data.id}`, formData);
        toast.success("Edit course success!");
      }

      fetchData();
      onClose();
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/courses/${id}`);
      fetchData();
      toast.success("Course is deleted!");
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await api.patch(`/courses/${id}/restore`);
      fetchData();
      toast.success("Course is restored!");
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      const response = await api.patch(`/courses/${id}/toggle-status`);
      fetchData();

      toast.success(response.data.message);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const onDetail = (courseId: number) => {
    navigate(`/courses/${courseId}`);
  };

  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize]);

  return (
    <div className="p-4">
      {isUseTitle && <PageTitle title="Course"></PageTitle>}

      <DataTable
        onAdd={onAdd}
        columns={courseColumns({
          handleDelete,
          handleRestore,
          handleToggle,
          onEdit,
          onDetail,
        })}
        data={data}
        total={total}
        pageIndex={pageIndex}
        pageSize={pageSize}
        setPageIndex={setPageIndex}
        setPageSize={setPageSize}
      />

      <CourseModal
        formManager={formManager}
        onClose={onClose}
        handleSubmit={handleSubmit}
      ></CourseModal>
    </div>
  );
};

export default Course;
