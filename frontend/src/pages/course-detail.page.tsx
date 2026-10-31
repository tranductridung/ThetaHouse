import api from "@/api/api";
import { format } from "date-fns";
import { useAuth } from "@/auth/useAuth";
import PageTitle from "@/components/Title";
import Enrollment from "./enrollment.page";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CourseStaff from "./course-staff.page";
import { formatCurrency, handleAxiosError } from "@/lib/utils";
import { useLoading } from "@/components/contexts/loading.context";
import type { CourseType } from "@/components/schemas/course.schema";
import { RequirePermission } from "@/components/commons/require-permission";

type CourseDetailProps = { isUseTitle?: boolean };

const CourseDetail = ({ isUseTitle = true }: CourseDetailProps) => {
  const { id } = useParams();
  const { setLoading } = useLoading();
  const { fetchPermissions } = useAuth();
  const [data, setData] = useState<CourseType>();
  const [isReady, setIsReady] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      const response = await api.get(`courses/${id}`);
      setData(response.data?.course);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  useEffect(() => {
    const run = async () => {
      try {
        setIsReady(false);
        setLoading(true);
        await fetchPermissions(["course", "enrollment"]);
        await fetchData();
      } finally {
        setIsReady(true);
        setLoading(false);
      }
    };

    run();
  }, [id]);

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700";
      case "completed":
        return "bg-gray-100 text-gray-700";
      case "upcoming":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getModeStyle = (mode: string) => {
    switch (mode?.toLowerCase()) {
      case "online":
        return "bg-blue-100 text-blue-700";
      case "offline":
        return "bg-purple-100 text-purple-700";
      case "hybrid":
        return "bg-indigo-100 text-indigo-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (isReady)
    return (
      <>
        <div className="px-4">
          {isUseTitle && <PageTitle title="Course Detail"></PageTitle>}
        </div>
        <RequirePermission permission="course:read" mode="disable">
          <>
            <div className="px-4">
              <div className="bg-white border border-gray-300 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {data?.name || "Course Name"}
                  </h1>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(
                      data?.status || ""
                    )}`}
                  >
                    {data?.status
                      ? data.status.charAt(0).toUpperCase() +
                        data.status.slice(1)
                      : "Status"}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getModeStyle(
                      data?.mode || ""
                    )}`}
                  >
                    {data?.mode
                      ? data.mode.charAt(0).toUpperCase() + data.mode.slice(1)
                      : "Mode"}
                  </span>
                </div>

                <p className="text-gray-600 mb-6">{data?.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500 mb-1">Price</div>
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(data?.price ?? 0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Start Date</div>
                    {data?.startDate ? (
                      <div className="font-semibold text-gray-900">
                        {format(
                          new Date(data.startDate),
                          "HH:mm:ss dd/MM/yyyy"
                        )}
                      </div>
                    ) : null}
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Max Students</div>
                    <div className="font-semibold text-gray-900">
                      {data?.maxStudent}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Sessions</div>
                    <div className="font-semibold text-gray-900">
                      {data?.onlineSession && data?.onlineSession + " online"}
                      {data?.offlineSession &&
                        " and " + data?.offlineSession + " offline"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <Enrollment courseId={Number(id)}></Enrollment>
            </div>

            <div className="flex flex-col justify-center border-t-2 pt-5">
              <CourseStaff currentCourse={data}></CourseStaff>
            </div>
          </>
        </RequirePermission>
      </>
    );
};

export default CourseDetail;
