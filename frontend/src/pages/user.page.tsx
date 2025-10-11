"use client";

import api from "@/api/api";
import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import type { UserType } from "@/components/schemas/user.schema";
import { userColumns } from "@/components/columns/user.column";
import type { UserRoleConst } from "@/components/constants/constants";
import { toast } from "sonner";
import { handleAxiosError } from "@/lib/utils";
import PageTitle from "@/components/Title";
import { useAuth } from "@/auth/useAuth";
import { useLoading } from "@/components/contexts/loading.context";

type UserProps = {
  isUseTitle?: boolean;
};

const User = ({ isUseTitle = true }: UserProps) => {
  const { setLoading } = useLoading();
  const { fetchPermissions } = useAuth();

  const [data, setData] = useState<UserType[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchData = async () => {
    try {
      const response = await api.get(
        `/users?page=${pageIndex}&limit=${pageSize}`
      );
      setData(response.data.users);
      setTotal(response.data.total);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const toggleStatus = async (id: number) => {
    try {
      const response = await api.patch(`/users/${id}/toggle-status`);
      fetchData();

      toast.success(response.data.message);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleChangeRole = async (id: number, role: UserRoleConst) => {
    try {
      const response = await api.patch(`users/${id}/change-role`, { role });
      fetchData();

      toast.success(response.data.message);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        await fetchPermissions("user");
        await fetchData();
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [pageIndex, pageSize]);
  const { user } = useAuth();

  return (
    <div className="p-4">
      {isUseTitle && <PageTitle title="User"></PageTitle>}

      <DataTable
        columns={userColumns({
          toggleStatus,
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
    </div>
  );
};
export default User;
