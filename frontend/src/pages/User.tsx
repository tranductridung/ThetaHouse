"use client";

import api from "@/api/api";
import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import type { UserType } from "@/components/schemas/user";
import { userColumns } from "@/components/columns/user-column";
import { UserRoleEnum } from "@/components/constants/constants";
import { toast } from "sonner";
import { handleAxiosError } from "@/lib/utils";

const User = () => {
  const [data, setData] = useState<UserType[]>([]);

  const toggleStatus = async (id: number) => {
    try {
      await api.patch(`/users/${id}/toggle-status`);

      let newStatus = "";

      setData((prev) => {
        return prev.map((user) => {
          if (user.id !== id) return user;

          // Toggle status
          newStatus = user.status === "Active" ? "Inactive" : "Active";
          return { ...user, status: newStatus };
        });
      });

      toast.success(`Change status success!`, {
        description: `User is ${
          newStatus === "Active" ? "enabled" : "disabled"
        }`,
      });
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleChangeRole = async (id: number, role: UserRoleEnum) => {
    try {
      await api.patch(`users/${id}/change-role`, { role });
      setData((prev) =>
        prev.map(
          (user) =>
            user.id === id
              ? { ...user, role } // change role when user matched
              : user // user not match)
        )
      );

      toast.success(`Change role success!`, {
        description: `User role is changed to  ${role}`,
      });
    } catch (error) {
      handleAxiosError(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await api.get("/users");
      setData(response.data.users);
    };
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <DataTable
        columns={userColumns({
          toggleStatus,
          handleChangeRole,
        })}
        data={data}
      />
    </div>
  );
};
export default User;
