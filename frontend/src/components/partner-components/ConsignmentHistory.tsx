import type { PartnerTypeConst } from "../constants/constants";

type ConsignmentHistoryProps = {
  partnerId: number;
  partnerType: PartnerTypeConst;
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
