import api from "@/api/api";
import AppointmentForm from "@/components/forms/AppointmentForm";
import type {
  AppointmentDraftType,
  AppointmentType,
} from "@/components/schemas/appointment";
import { useState } from "react";
export type FormManagerType = {
  isShow: boolean;
  type: "add" | "edit";
  data: AppointmentType | null;
};
const CreateAppointment = () => {
  const [formManager, setFormManager] = useState<FormManagerType>({
    isShow: false,
    type: "add",
    data: null,
  });

  const handleSubmit = async (formData: AppointmentDraftType) => {
    console.log(formData);
    return;
    try {
      if (formManager.type === "add") {
        const response = await api.post("/appointments", formData);
        setData((prev) => [...prev, response.data.appointment]);
      } else if (formManager.type === "edit" && formManager.data?.id) {
        const response = await api.patch(
          `/appointments/${formManager.data.id}`,
          formData
        );
        setData((prev) =>
          prev.map((appointment) =>
            appointment.id === formManager.data?.id
              ? response.data.appointment
              : appointment
          )
        );
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

  return (
    <>
      <div className="max-w-[85%] mx-auto py-10 flex flex-col">
        <AppointmentForm
          type={"add"}
          onSubmit={handleSubmit}
          appointmentData={null}
        />
      </div>
    </>
  );
};

export default CreateAppointment;
