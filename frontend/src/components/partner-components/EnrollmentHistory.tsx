import Enrollment from "@/pages/enrollment.page";

type EnrollmentHistoryProps = {
  customerId: number;
};

const EnrollmentHistory = ({ customerId }: EnrollmentHistoryProps) => {
  return (
    <div>
      <Enrollment
        isUseTitle={false}
        customerId={Number(customerId)}
      ></Enrollment>
    </div>
  );
};

export default EnrollmentHistory;
