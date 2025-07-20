import Consignment from "@/pages/consignment.page";
import type { TypeOfPartner } from "../constants/constants";

type ConsignmentHistoryProps = {
  partnerId: number;
  partnerType: TypeOfPartner;
};

const ConsignmentHistory = ({
  partnerId,
  partnerType,
}: ConsignmentHistoryProps) => {
  return (
    <div>
      <Consignment
        partnerId={Number(partnerId)}
        partnerType={partnerType}
      ></Consignment>
    </div>
  );
};

export default ConsignmentHistory;
