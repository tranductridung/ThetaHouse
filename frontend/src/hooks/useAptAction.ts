import api from "@/api/api";
import type { AppointmentDraftType } from "@/components/schemas/appointment.schema";
import { handleAxiosError } from "@/lib/utils";
import { toast } from "sonner";

export const useAptAction = (refetch: () => void) => {
  const handleCreateAppointmnet = async (
    formData: AppointmentDraftType,
    customerId: number,
    selectedItemId?: number
  ) => {
    const newModules: number[] = formData.modules?.map((m) => m.id) ?? [];

    const payload = {
      note: formData.note,
      customerId: customerId,
      type: formData.type,
      duration: formData.duration,
      startAt: formData.startAt,
      roomId: formData.room?.id || undefined,
      healerId: formData.healer?.id || undefined,
      moduleIds: newModules,
      itemId: selectedItemId,
    };

    try {
      const response = await api.post(`/appointments`, payload);
      toast.success("Create appointment success!");
      refetch();
      return response;
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleSubmitEdit = async (
    formData: AppointmentDraftType,
    aptId: number
  ) => {
    const newModules: number[] = formData.modules?.map((m) => m.id) ?? [];

    const payload = {
      note: formData.note,
      type: formData.type,
      startAt: formData?.startAt?.toISOString(),
      roomId: formData.room?.id || undefined,
      healerId: formData.healer?.id || undefined,
      moduleIds: newModules,
    };
    console.log("payload", payload);
    try {
      await api.patch(`/appointments/${aptId}`, payload);

      toast.success("Update appointment success!");
      refetch();
    } catch (error) {
      handleAxiosError(error);
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
    handleCreateAppointmnet,
    handleSubmitEdit,
    handleSetComplete,
    removeAppointment,
  };
};
