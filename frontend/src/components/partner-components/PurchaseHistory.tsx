import Purchase from "@/pages/purchase.page";

type PurchaseHistoryProps = {
  supplierId: number;
};

const PurchaseHistory = ({ supplierId }: PurchaseHistoryProps) => {
  return (
    <div>
      <Purchase supplierId={Number(supplierId)}></Purchase>
    </div>
  );
};

export default PurchaseHistory;
