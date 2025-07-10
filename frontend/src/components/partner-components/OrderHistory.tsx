import Order from "@/pages/Order";

type OrderHistoryProps = {
  customerId: number;
};

const OrderHistory = ({ customerId }: OrderHistoryProps) => {
  return (
    <div>
      <Order customerId={Number(customerId)}></Order>
    </div>
  );
};

export default OrderHistory;
