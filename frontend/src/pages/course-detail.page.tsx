import api from "@/api/api";
import PageTitle from "@/components/Title";
import Enrollment from "./enrollment.page";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CourseStaff from "./course-staff.page";
import { handleAxiosError } from "@/lib/utils";
import type { CourseType } from "@/components/schemas/course.schema";
import { RequirePermission } from "@/components/commons/require-permission";
import { useLoading } from "@/components/contexts/loading.context";
import { useAuth } from "@/auth/useAuth";

type CourseDetailProps = { isUseTitle?: boolean };

const CourseDetail = ({ isUseTitle = true }: CourseDetailProps) => {
  const { id } = useParams();
  const [data, setData] = useState<CourseType>();
  const { setLoading } = useLoading();
  const { fetchPermissions } = useAuth();

  const fetchData = async () => {
    try {
      const response = await api.get(`courses/${id}`);
      setData(response.data.course);
    } catch (error) {
      handleAxiosError(error);
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
  }, []);

  return (
    <>
      {isUseTitle && <PageTitle title="Course Detail"></PageTitle>}
      <RequirePermission permission="course:read" mode="disable">
        <>
          <div>CourseDetail</div>
          {data?.id} {data?.description} {data?.mode} {data?.name}{" "}
          {data?.maxStudent} {data?.offlineSession} {data?.onlineSession}{" "}
          {data?.price} {data?.startDate} {data?.status}{" "}
          <div className="flex flex-col justify-center ">
            <h1 className="font-bold text-center">ENROLLMENT</h1>
            <Enrollment courseId={Number(id)}></Enrollment>
          </div>
          <div className="flex flex-col justify-center border-t-2 pt-5">
            <h1 className="font-bold text-center">COURSE STAFF</h1>
            <CourseStaff courseId={Number(id)}></CourseStaff>
          </div>
        </>
      </RequirePermission>
    </>
  );
};

export default CourseDetail;
