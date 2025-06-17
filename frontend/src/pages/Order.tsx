import { useEffect, useState } from "react";
import type { OrderType } from "@/components/schemas/source";
import { orderColumns } from "@/components/columns/order-column";
import api from "@/api/api";
import { DataTable } from "@/components/data-table";
import { useNavigate } from "react-router-dom";
import { handleAxiosError } from "@/lib/utils";

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
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const onAdd = () => {
    navigate("/sources/orders/create");
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
      try {
        const response = await api.get(
          `/orders/all?page=${pageIndex}&limit=${pageSize}`
        );
        setData(response.data.orders);
        setTotal(response.data.total);
      } catch (error) {
        handleAxiosError(error);
      }
    };

    fetchData();
  }, [pageIndex, pageSize]);

  console.log(data);
  return (
    <div className="p-4">
      <DataTable
        onAdd={onAdd}
        columns={orderColumns({
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
    </div>
  );
};

export default Order;
