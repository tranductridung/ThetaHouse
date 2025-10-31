"use client";

import api from "@/api/api";
import { toast } from "sonner";
import { useAuth } from "@/auth/useAuth";
import PageTitle from "@/components/Title";
import { useEffect, useState } from "react";
import { handleAxiosError } from "@/lib/utils";
import { DataTable } from "@/components/data-table";
import { userColumns } from "@/components/columns/user.column";
import type { UserType } from "@/components/schemas/user.schema";
import type { RoleType } from "@/components/schemas/role.schema";
import { useLoading } from "@/components/contexts/loading.context";
import { RequirePermission } from "@/components/commons/require-permission";

type UserProps = {
  isUseTitle?: boolean;
};

const User = ({ isUseTitle = true }: UserProps) => {
  const { setLoading } = useLoading();
  const { fetchPermissions, user } = useAuth();

  const [data, setData] = useState<UserType[]>([]);
  const [roleList, setRoleList] = useState<RoleType[]>([]);
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

  const handleChangeRole = async (userId: number, roleId: number) => {
    try {
      setLoading(true);
      await api.patch(`/authorization/users/${userId}/roles`, {
        roleId,
      });
      fetchData();

      toast.success("Update user role success!");
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
        await fetchPermissions(["user", "authorization"]);
        await fetchData();
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [pageIndex, pageSize]);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        // Just get role list if user has permission to assign role for another user
        if (user?.permissions?.includes("authorization:create")) {
          const response = await api.get(`/authorization/roles`);
          setRoleList(response.data);
        }
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [user?.permissions]);

  return (
    <div className="p-4">
      {isUseTitle && <PageTitle title="User"></PageTitle>}

      <RequirePermission permission="user:read">
        <DataTable
          columns={userColumns({
            toggleStatus,
            handleChangeRole,
            roleList,
            user,
          })}
          data={data}
          total={total}
          pageIndex={pageIndex}
          pageSize={pageSize}
          setPageIndex={setPageIndex}
          setPageSize={setPageSize}
          permission={"user:create"}
        />
      </RequirePermission>
    </div>
  );
};
export default User;
