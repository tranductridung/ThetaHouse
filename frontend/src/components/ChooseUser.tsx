import { DataTable } from "@/components/data-table";
import type { UserType } from "./schemas/user.schema";
import { chooseUserColumns } from "./columns/choose-user.column";
import { useEffect, useState } from "react";
import api from "@/api/api";
import { handleAxiosError } from "@/lib/utils";
type ChooseUserProps = {
  handleChooseUser: (user: UserType) => void;
};

const ChooseUser = ({ handleChooseUser }: ChooseUserProps) => {
  const [data, setData] = useState<UserType[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    try {
      const fetchData = async () => {
        const response = await api.get(
          `/users?page=${pageIndex}&limit=${pageSize}`
        );
        setData(response.data.users);
        setTotal(response.data.total);
      };
      fetchData();
    } catch (error) {
      handleAxiosError(error);
    }
  }, [pageIndex, pageSize]);

  return (
    <div>
      <DataTable
        onAdd={undefined}
        columns={chooseUserColumns({
          handleChooseUser,
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
export default ChooseUser;
