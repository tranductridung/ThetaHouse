import api from "@/api/api";
import { toast } from "sonner";
import { useAuth } from "@/auth/useAuth";
import PageTitle from "@/components/Title";
import { useEffect, useState } from "react";
import { handleAxiosError } from "@/lib/utils";
import { DataTable } from "@/components/data-table";
import { useLoading } from "@/components/contexts/loading.context";
import type { CourseStaffType } from "@/components/schemas/course.schema";
import { RequirePermission } from "@/components/commons/require-permission";
import { courseStaffColumns } from "@/components/columns/courst-staff.column";

export type FormManagerType = {
  isShow: boolean;
  type: "add" | "edit";
  data: CourseStaffType | null;
};

type CourseStaffProps = { courseId?: number; isUseTitle?: boolean };

const CourseStaff = ({ courseId, isUseTitle = true }: CourseStaffProps) => {
  const { fetchPermissions } = useAuth();
  const { setLoading } = useLoading();

  const [data, setData] = useState<CourseStaffType[]>([]);
  // const [formManager, setFormManager] = useState<FormManagerType>({
  //   isShow: false,
  //   type: "add",
  //   data: null,
  // });
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchData = async () => {
    try {
      const url = courseId
        ? `/courses/${courseId}/staff?page=${pageIndex}&limit=${pageSize}`
        : `/courses/staff?page=${pageIndex}&limit=${pageSize}`;

      const response = await api.get(url);

      setData(response.data.courseStaffies);
      setTotal(response.data.total);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  // const handleSubmit = async (formData: CourseStaffFormType) => {
  //   console.log("submit", formData);

  //   try {
  //     if (formManager.type === "add") {
  //       await api.post("/courseStaffs", formData);
  //       toast.success("Add courseStaff success!");
  //     } else if (formManager.type === "edit" && formManager.data?.id) {
  //       await api.patch(`/courseStaffs/${formManager.data.id}`, formData);
  //       toast.success("Edit courseStaff success!");
  //     }

  //     fetchData();
  //     setFormManager({ isShow: false, type: "add", data: null });
  //   } catch (error) {
  //     handleAxiosError(error);
  //   }
  // };

  const onEdit = (courseStaff: CourseStaffType) => {
    console.log("edit", courseStaff);
    // setFormManager({
    //   isShow: true,
    //   type: "edit",
    //   data: courseStaff,
    // });
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
        await fetchPermissions(["course"]);
        await fetchData();
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [pageIndex, pageSize]);

  return (
    <div className="p-4">
      {isUseTitle && <PageTitle title="Course Staff"></PageTitle>}
      <RequirePermission permission="course:read">
        <DataTable
          onAdd={undefined}
          columns={courseStaffColumns({
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
      {/* 
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
          <CourseStaffForm
            courseStaffData={formManager.data}
            onSubmit={handleSubmit}
            type={formManager.type}
          />
        </DialogContent>
      </Dialog> */}
    </div>
  );
};

export default CourseStaff;
