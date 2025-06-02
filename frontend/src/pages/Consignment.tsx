import { useEffect, useState } from "react";
import type {
  CreateConsignmentFormType,
  EditConsignmentFormType,
  ConsignmentType,
} from "@/components/schemas/source";
import api from "@/api/api";
import { DataTable } from "@/components/data-table";
import { toast } from "sonner";
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
  const navigate = useNavigate();

  const handleSubmit = async (
    formData: CreateConsignmentFormType | EditConsignmentFormType
  ) => {
    try {
      if (formManager.type === "add") {
        const response = await api.post("/consignments", formData);
        setData((prev) => [...prev, response.data.consignment]);
        toast.success(`Create partner success!`);
      } else if (formManager.type === "edit" && formManager.data?.id) {
        const response = await api.patch(
          `/consignments/${formManager.data.id}`,
          formData
        );
        setData((prev) =>
          prev.map((consignment) =>
            consignment.id === formManager.data?.id
              ? response.data.consignment
              : consignment
          )
        );
        toast.success(`Create partner success!`);
      }

      setFormManager({
        isShow: false,
        type: "add",
        data: null,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const onAdd = () => {
    setFormManager({
      isShow: true,
      type: "add",
      data: null,
    });
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
    console.log("hello", id);
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await api.get("/consignments");
      setData(response.data.consignments);
      console.log(response.data.consignments);
    };
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <DataTable
        onAdd={onAdd}
        columns={consignmentColumns({
          onDetail,
          onEdit,
        })}
        data={data}
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
