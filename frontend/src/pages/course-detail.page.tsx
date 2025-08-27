import api from "@/api/api";
import type { CourseType } from "@/components/schemas/course.schema";
import { handleAxiosError } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Enrollment from "./enrollment.page";
import CourseStaff from "./course-staff.page";
import PageTitle from "@/components/Title";

type CourseDetailProps = { isUseTitle?: boolean };

const CourseDetail = ({ isUseTitle = true }: CourseDetailProps) => {
  const { id } = useParams();
  const [data, setData] = useState<CourseType>();
 
  const fetchData = async () => {
    try {
      const response = await api.get(`courses/${id}`);
      setData(response.data.course);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  console.log(data);
  return (
    <>
      {isUseTitle && <PageTitle title="Course Detail"></PageTitle>}
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
  );
};

export default CourseDetail;
