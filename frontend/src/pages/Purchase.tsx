import { useEffect, useState } from "react";
import type { PurchaseType } from "@/components/schemas/source";
import api from "@/api/api";
import { DataTable } from "@/components/data-table";
import { useNavigate } from "react-router-dom";
import { purchaseColumns } from "@/components/columns/purchase-column";
import { handleAxiosError } from "@/lib/utils";

export type FormManagerType = {
  isShow: boolean;
  type: "add" | "edit";
  data: PurchaseType | null;
};

const Purchase = () => {
  const [data, setData] = useState<PurchaseType[]>([]);
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
  //   formData: CreatePurchaseDetailFormType | EditPurchaseFormType
  // ) => {
  //   try {
  //     if (formManager.type === "add") {
  //       const response = await api.post("/purchases", formData);
  //       setData((prev) => [...prev, response.data.purchase]);
  //       toast.success(`Create partner success!`);
  //     } else if (formManager.type === "edit" && formManager.data?.id) {
  //       const response = await api.patch(
  //         `/purchases/${formManager.data.id}`,
  //         formData
  //       );
  //       setData((prev) =>
  //         prev.map((purchase) =>
  //           purchase.id === formManager.data?.id
  //             ? response.data.purchase
  //             : purchase
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
    navigate("/sources/purchases/create");
  };

  const onEdit = (purchase: PurchaseType) => {
    setFormManager({
      isShow: true,
      type: "edit",
      data: purchase,
    });
  };

  const onDetail = (id: number) => {
    navigate(`/sources/purchases/${id}`);
    console.log("hello", id);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(
          `/purchases?page=${pageIndex}&limit=${pageSize}`
        );
        setData(response.data.purchases);
        setTotal(response.data.total);
      } catch (error) {
        handleAxiosError(error);
      }
    };

    fetchData();
  }, [pageIndex, pageSize]);

  return (
    <div className="p-4">
      <DataTable
        onAdd={onAdd}
        columns={purchaseColumns({
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
          <PurchaseForm
            purchaseData={formManager.data}
            onSubmit={handleSubmit}
            type={formManager.type}
          />
        </DialogContent>
      </Dialog> */}
    </div>
  );
};

export default Purchase;
