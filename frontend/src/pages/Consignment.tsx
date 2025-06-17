import { useEffect, useState } from "react";
import type { ConsignmentType } from "@/components/schemas/source";
import api from "@/api/api";
import { DataTable } from "@/components/data-table";
import { useNavigate } from "react-router-dom";
import { consignmentColumns } from "@/components/columns/consigment-column";

export type FormManagerType = {
  isShow: boolean;
  type: "add" | "edit";
  data: ConsignmentType | null;
};

const Consignment = () => {
  const [data, setData] = useState<ConsignmentType[]>([]);
  const [formManager, setFormManager] = useState<FormManagerType>({
    isShow: false,
    type: "add",
    data: null,
  });
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const navigate = useNavigate();

  // const handleSubmit = async (
  //   formData: CreateConsignmentDetailFormType | EditConsignmentDetailFormType
  // ) => {
  //   try {
  //     if (formManager.type === "add") {
  //       const response = await api.post("/consignments", formData);
  //       setData((prev) => [...prev, response.data.consignment]);
  //       toast.success(`Create partner success!`);
  //     } else if (formManager.type === "edit" && formManager.data?.id) {
  //       const response = await api.patch(
  //         `/consignments/${formManager.data.id}`,
  //         formData
  //       );
  //       setData((prev) =>
  //         prev.map((consignment) =>
  //           consignment.id === formManager.data?.id
  //             ? response.data.consignment
  //             : consignment
  //         )
  //       );
  //       toast.success(`Create partner success!`);
  //     }

  //     setFormManager({
  //       isShow: false,
  //       type: "add",
  //       data: null,
  //     });
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const onAdd = () => {
    navigate("/sources/consignments/create");
  };

  const onEdit = (consignment: ConsignmentType) => {
    setFormManager({
      isShow: true,
      type: "edit",
      data: consignment,
    });
  };

  const onDetail = (id: number) => {
    navigate(`/sources/consignments/${id}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await api.get(
        `/consignments?page=${pageIndex}&limit=${pageSize}`
      );
      console.log(response);
      setData(response.data.consignments);
      setTotal(response.data.total);
    };
    fetchData();
  }, [pageIndex, pageSize]);

  return (
    <div className="p-4">
      <DataTable
        onAdd={onAdd}
        columns={consignmentColumns({
          onDetail,
          onEdit,
        })}
        data={data}
        total={total}
        pageIndex={pageIndex}
        pageSize={pageSize}
        setPageIndex={setPageIndex}
        setPageSize={setPageSize}
      />

      {/*  <Dialog
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
          <ConsignmentForm
            consignmentData={formManager.data}
            onSubmit={handleSubmit}
            type={formManager.type}
          />
        </DialogContent>
      </Dialog> */}
    </div>
  );
};

export default Consignment;
