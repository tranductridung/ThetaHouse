import Appointment from "@/pages/appointment.page";

type TherapyAppointmentProps = {
  customerId?: number;
};

const TherapyAppointment = ({ customerId }: TherapyAppointmentProps) => {
  return (
    <div className="flex flex-col gap-5 p-4 justify-end">
      <Appointment
        appointmentCategory="Therapy"
        customerId={Number(customerId)}
      />
    </div>
  );
};

export default TherapyAppointment;
