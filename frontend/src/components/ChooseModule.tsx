import api from "@/api/api";
import { useEffect, useState } from "react";
import { handleAxiosError } from "@/lib/utils";
import type { ModuleType } from "./schemas/module";
import { DataTable } from "@/components/data-table";
import { chooseModuleColumns } from "./columns/choose-module";

type ChooseModuleProps = {
  handleChooseModule: (module: ModuleType) => void;
};

const ChooseModule = ({ handleChooseModule }: ChooseModuleProps) => {
  const [data, setData] = useState<ModuleType[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    try {
      const fetchData = async () => {
        const response = await api.get(
          `/modules?page=${pageIndex}&limit=${pageSize}`
        );
        setData(response.data.modules);
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
        columns={chooseModuleColumns({
          handleChooseModule,
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
export default ChooseModule;
