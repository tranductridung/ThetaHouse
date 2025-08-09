import api from "@/api/api";
import type { AppointmentDraftType } from "@/components/schemas/appointment.schema";
import { handleAxiosError } from "@/lib/utils";
import { toast } from "sonner";

export const useAptAction = (refetch: () => void) => {
  const handleCreateAppointment = async (
    formData: AppointmentDraftType,
    formType: "add" | "addFree" | "consultation",
    selectedItemId?: number,
    customerId?: number
  ) => {
    const newModules: number[] = formData.modules?.map((m) => m.id) ?? [];

    let payload;

    if (formType !== "consultation") {
      payload = {
        note: formData.note,
        duration: formData.duration,
        startAt: formData.startAt,
        healerId: formData?.healer?.id,
        customerId: customerId,
        roomId: formData.room?.id,
        type: formData.type,
        moduleIds: newModules,
        itemId: selectedItemId,
      };
    } else {
      payload = {
        note: formData.note,
        duration: formData.duration,
        startAt: formData.startAt,
        healerId: formData?.healer?.id,
        customerId: customerId,
      };
    }

    try {
      await api.post(
        `/appointments/${
          formType === "consultation" ? "consultation" : "therapy"
        }`,
        payload
      );
      toast.success("Create appointment success!");
      refetch();
      return true;
    } catch (error) {
      handleAxiosError(error);
      return false;
    }
  };

  const handleSubmitEdit = async (
    formData: AppointmentDraftType,
    aptId: number
  ) => {
    const newModules: number[] = formData.modules?.map((m) => m.id) ?? [];

    const payload =
      formData.category === "Therapy"
        ? {
            note: formData.note,
            type: formData.type,
            startAt: formData?.startAt?.toISOString(),
            roomId: formData.room?.id || undefined,
            healerId: formData.healer?.id || undefined,
            moduleIds: newModules,
          }
        : {
            note: formData.note,
            startAt: formData?.startAt?.toISOString(),
            healerId: formData.healer?.id || undefined,
          };

    try {
      await api.patch(
        `/appointments/${formData.category.toLowerCase()}/${aptId}`,
        payload
      );

      toast.success("Update appointment success!");
      refetch();
      return true;
    } catch (error) {
      handleAxiosError(error);
      return false;
    }
  };

  const handleSetComplete = async (appointmentId: number) => {
    try {
      await api.post(`appointments/${appointmentId}/complete`);
      refetch();
      toast.success("Appointment is set to completed!");
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const removeAppointment = async (appointmentId: number) => {
    try {
      await api.delete(`appointments/${appointmentId}`);
      refetch();
      toast.success("Appointment is removed!");
    } catch (error) {
      handleAxiosError(error);
    }
  };
  return {
    handleCreateAppointment,
    handleSubmitEdit,
    handleSetComplete,
    removeAppointment,
  };
};
