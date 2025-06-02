import api from "@/api/api";
import { itemColumns, type ItemType } from "@/components/columns/item-column";
import { DataTable } from "@/components/data-table";

import { useEffect, useState } from "react";

const Item = () => {
  const [data, setData] = useState<ItemType[]>([]);

  const onAdd = () => {
    console.log("item");
  };
  useEffect(() => {
    const fetchData = async () => {
      const response = await api.get("/items");
      setData(response.data.items);
    };
    fetchData();
  }, []);
  return (
    <div className="p-4">
      <DataTable columns={itemColumns} data={data} onAdd={onAdd} />
    </div>
  );
};

export default Item;
