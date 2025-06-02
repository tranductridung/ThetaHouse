import { useEffect, useState } from "react";
import type {
  CreateOrderFormType,
  EditOrderFormType,
  OrderType,
} from "@/components/schemas/source";
import { orderColumns } from "@/components/columns/order-column";
import api from "@/api/api";
import { DataTable } from "@/components/data-table";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export type FormManagerType = {
  isShow: boolean;
  type: "add" | "edit";
  data: OrderType | null;
};

const Order = () => {
  const [data, setData] = useState<OrderType[]>([]);
  const [formManager, setFormManager] = useState<FormManagerType>({
    isShow: false,
    type: "add",
    data: null,
  });
  const navigate = useNavigate();

  const handleSubmit = async (
    formData: CreateOrderFormType | EditOrderFormType
  ) => {
    try {
      if (formManager.type === "add") {
        const response = await api.post("/orders", formData);
        setData((prev) => [...prev, response.data.order]);
        toast.success(`Create partner success!`);
      } else if (formManager.type === "edit" && formManager.data?.id) {
        const response = await api.patch(
          `/orders/${formManager.data.id}`,
          formData
        );
        setData((prev) =>
          prev.map((order) =>
            order.id === formManager.data?.id ? response.data.order : order
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

  const onEdit = (order: OrderType) => {
    setFormManager({
      isShow: true,
      type: "edit",
      data: order,
    });
  };

  const onDetail = (id: number) => {
    navigate(`/sources/orders/${id}`);
    console.log("hello", id);
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await api.get("/orders");
      setData(response.data.orders);
      console.log(response.data.orders);
    };
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <DataTable
        onAdd={onAdd}
        columns={orderColumns({
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
          <OrderForm
            orderData={formManager.data}
            onSubmit={handleSubmit}
            type={formManager.type}
          />
        </DialogContent>
      </Dialog> */}
    </div>
  );
};

export default Order;
