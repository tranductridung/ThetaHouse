import ConsignmentHistory from "@/components/partner-components/ConsignmentHistory";
import OrderHistory from "@/components/partner-components/OrderHistory";
import PersonalInfor from "@/components/partner-components/PersonalInfor";
import PurchaseHistory from "@/components/partner-components/PurchaseHistory";
import TherapyAppointment from "@/components/partner-components/TherapyAppointment";
import { Tabs, TabsTrigger, TabsList, TabsContent } from "@/components/ui/tabs";
import { useParams } from "react-router-dom";

const PartnerDetail = () => {
  const { partnerType, id } = useParams();

  return (
    <div className="w-full h-full">
      <Tabs defaultValue="Personal Information" className="w-full h-full">
        <TabsList>
          <TabsTrigger value="Personal Information">
            Personal Information
          </TabsTrigger>
          <TabsTrigger value="Consultation Appointment">
            Consultation Appointment
          </TabsTrigger>
          <TabsTrigger value="Therapy Appointment">
            Therapy Appointment
          </TabsTrigger>
          {partnerType === "customers" ? (
            <TabsTrigger value="Order History">Order History</TabsTrigger>
          ) : (
            <TabsTrigger value="Purchase History">Purchase History</TabsTrigger>
          )}
          <TabsTrigger value="Consignment History">
            Consignment History
          </TabsTrigger>
          <TabsTrigger value="Debt">Debt</TabsTrigger>
        </TabsList>

        <TabsContent value="Personal Information">
          <PersonalInfor
            partnerId={Number(id)}
            partnerType={partnerType === "Customer" ? "Customer" : "Supplier"}
          ></PersonalInfor>
        </TabsContent>

        <TabsContent value="Consultation Appointment">
          <div>Consultation Appointment</div>
        </TabsContent>

        <TabsContent value="Consignment History">
          <ConsignmentHistory
            partnerId={Number(id)}
            partnerType={partnerType === "Customer" ? "Customer" : "Supplier"}
          ></ConsignmentHistory>
        </TabsContent>

        <TabsContent value="Order History">
          <OrderHistory customerId={Number(id)}></OrderHistory>
        </TabsContent>

        <TabsContent value="Purchase History">
          <PurchaseHistory supplierId={Number(id)}></PurchaseHistory>
        </TabsContent>

        <TabsContent value="Therapy Appointment">
          <TherapyAppointment customerId={Number(id)}></TherapyAppointment>
        </TabsContent>
        <TabsContent value="Debt">
          <div>Debt</div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PartnerDetail;
