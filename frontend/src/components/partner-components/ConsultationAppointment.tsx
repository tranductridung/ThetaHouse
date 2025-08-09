import Appointment from "@/pages/appointment.page";

type ConsultationAppointmentProps = {
  customerId?: number;
};

const ConsultationAppointment = ({
  customerId,
}: ConsultationAppointmentProps) => {
  return (
    <div className="flex flex-col gap-5 p-4 justify-end">
      <Appointment
        appointmentCategory="Consultation"
        customerId={Number(customerId)}
      />
    </div>
  );
};

export default ConsultationAppointment;
