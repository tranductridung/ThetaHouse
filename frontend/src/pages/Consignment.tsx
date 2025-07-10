import { useEffect, useState } from "react";
import type { ConsignmentType } from "@/components/schemas/source";
import api from "@/api/api";
import { DataTable } from "@/components/data-table";
import { useNavigate } from "react-router-dom";
import { consignmentColumns } from "@/components/columns/consigment-column";
import { useSourceActions } from "@/hooks/useSourceAction";
import type { TypeOfPartner } from "@/components/constants/constants";

type ConsignmentProps = {
  partnerId?: number | undefined;
  partnerType?: TypeOfPartner;
};
const Consignment = ({ partnerId, partnerType }: ConsignmentProps) => {
  const [data, setData] = useState<ConsignmentType[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const navigate = useNavigate();

  const onAdd = () => {
    navigate("/sources/consignments/create");
  };

  const onDetail = (id: number) => {
    navigate(`/sources/consignments/${id}`);
  };

  const fetchData = async () => {
    let url = `/consignments?page=${pageIndex}&limit=${pageSize}`;

    if (partnerId && partnerType) {
      const tmp = partnerType === "Customer" ? "customers" : "suppliers";
      url = `/partners/${tmp}/${partnerId}/consignments?page=${pageIndex}&limit=${pageSize}`;
    }

    const response = await api.get(url);

    setData(response.data.consignments);
    setTotal(response.data.total);
  };
  const { handleExportImport } = useSourceActions(fetchData);

  const onHandle = async (id: number) => {
    handleExportImport(id, "Consignment");
  };
  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize]);

  return (
    <div className="p-4">
      <DataTable
        onAdd={onAdd}
        columns={consignmentColumns({
          onDetail,
          onHandle,
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

export default Consignment;
