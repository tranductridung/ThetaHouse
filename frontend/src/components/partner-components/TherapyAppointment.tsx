import { useRef } from "react";
import { Button } from "../ui/button";
import Appointment from "@/pages/appointment.page";

type TherapyAppointmentProps = {
  customerId: number;
};

const TherapyAppointment = ({ customerId }: TherapyAppointmentProps) => {
  const appointmentRef = useRef();

  const handleCreateClick = () => {
    appointmentRef.current?.openDialog();
  };

  return (
    <div className="flex flex-col gap-5 p-4 justify-end">
      <Button type="button" onClick={handleCreateClick} className="w-fit">
        Book Free Appointment
      </Button>

      <Appointment ref={appointmentRef} customerId={Number(customerId)} />
    </div>
  );
};

export default TherapyAppointment;
