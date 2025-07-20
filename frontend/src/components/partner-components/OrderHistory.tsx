import Order from "@/pages/order.page";

type OrderHistoryProps = {
  customerId: number;
};

const OrderHistory = ({ customerId }: OrderHistoryProps) => {
  return (
    <div>
      <Order isUseTitle={false} customerId={Number(customerId)}></Order>
    </div>
  );
};

export default OrderHistory;
