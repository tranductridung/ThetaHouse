import { Tabs, TabsTrigger, TabsList, TabsContent } from "@/components/ui/tabs";
import { useParams } from "react-router-dom";

const CustomerDetail = () => {
  const { id } = useParams();

  return (
    <div>
      customer number {id}
      <Tabs defaultValue="Personal Information" className="w-[400px]">
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
          <TabsTrigger value="Order History">Order History</TabsTrigger>
          <TabsTrigger value="Debt">Debt</TabsTrigger>
        </TabsList>

        <TabsContent value="Personal Information">
          <div>Personal Information</div>
        </TabsContent>
        <TabsContent value="Consultation Appointment">
          <div>Consultation Appointment</div>
        </TabsContent>
        <TabsContent value="Order History">
          <div>Order History</div>
        </TabsContent>
        <TabsContent value="Therapy Appointment">
          <div>Therapy Appointment</div>
        </TabsContent>
        <TabsContent value="Debt">
          <div>Debt</div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerDetail;
