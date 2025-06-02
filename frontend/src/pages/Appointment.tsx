import api from "@/api/api";
import {
  appointmentColumns,
  type AppointmentType,
} from "@/components/columns/appointment-column";
import { DataTable } from "@/components/data-table";

import { useEffect, useState } from "react";

const Appointment = () => {
  const [data, setData] = useState<AppointmentType[]>([]);

  const onAdd = () => {
    console.log("appointment");
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await api.get("/appointments");
      setData(response.data.appointments);
    };
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <DataTable onAdd={onAdd} columns={appointmentColumns} data={data} />
    </div>
  );
};

export default Appointment;
