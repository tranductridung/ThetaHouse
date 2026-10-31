import type {
  CourseStaffType,
  CourseType,
} from "@/components/schemas/course.schema";
import api from "@/api/api";
import { toast } from "sonner";
import { useAuth } from "@/auth/useAuth";
import PageTitle from "@/components/Title";
import { useEffect, useState } from "react";
import { handleAxiosError } from "@/lib/utils";
import { DataTable } from "@/components/data-table";
import { useCreateFormManager } from "@/hooks/use-custom-manager";
import { useLoading } from "@/components/contexts/loading.context";
import CourseStaffModal from "@/components/modals/course-staff.modal";
import { RequirePermission } from "@/components/commons/require-permission";
import { courseStaffColumns } from "@/components/columns/courst-staff.column";

export type FormManagerType = {
  isShow: boolean;
  type: "add" | "edit";
  data: CourseStaffType | null;
};

type CourseStaffProps = { isUseTitle?: boolean; currentCourse?: CourseType };

const CourseStaff = ({
  currentCourse,
  isUseTitle = true,
}: CourseStaffProps) => {
  const { fetchPermissions, user } = useAuth();
  const { setLoading } = useLoading();
  const [data, setData] = useState<CourseStaffType[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const { formManager, onAdd, onClose } = useCreateFormManager();

  const fetchData = async () => {
    try {
      const url = currentCourse
        ? `/courses/${currentCourse.id}/staff?page=${pageIndex}&limit=${pageSize}`
        : `/courses/staff?page=${pageIndex}&limit=${pageSize}`;

      const response = await api.get(url);

      setData(response.data.courseStaffies);
      setTotal(response.data.total);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleSubmit = async (formData: CourseStaffType) => {
    try {
      setLoading(true);
      await api.post(`/courses/${formData.course.id}/staff`, {
        role: formData.role,
        staffId: formData.staff.id,
      });
      onClose();
      await fetchData();

      toast.success("Add staff success!");
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId: number, staffId: number) => {
    try {
      setLoading(true);
      await api.delete(`/courses/${courseId}/staff/${staffId}`);
      fetchData();
      toast.success("Staff is deleted!");
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

        const hasCoursePermission = user?.permissions?.some((p) =>
          p.startsWith("course:")
        );

        if (!hasCoursePermission) {
          await fetchPermissions(["course"]);
        }

        await fetchData();
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [pageIndex, pageSize]);

  const handleChangeRole = async (
    courseId: number,
    staffId: number,
    courseRole: string
  ) => {
    try {
      setLoading(true);
      await api.patch(`/courses/${courseId}/staff/${staffId}/change-role`, {
        role: courseRole,
      });
      await fetchData();
      toast.success("Change role success!");
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      {isUseTitle && <PageTitle title="Course Staff"></PageTitle>}
      <RequirePermission permission="course:read">
        <DataTable
          onAdd={onAdd}
          columns={courseStaffColumns({
            handleDelete,
            handleChangeRole,
            user,
          })}
          data={data}
          total={total}
          pageIndex={pageIndex}
          pageSize={pageSize}
          setPageIndex={setPageIndex}
          setPageSize={setPageSize}
        />
      </RequirePermission>

      <CourseStaffModal
        currentCourse={currentCourse}
        formManager={formManager}
        onClose={onClose}
        handleSubmit={handleSubmit}
      ></CourseStaffModal>
    </div>
  );
};

export default CourseStaff;
