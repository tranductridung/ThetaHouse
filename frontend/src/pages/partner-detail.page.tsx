import api from "@/api/api";
import ConsignmentHistory from "@/components/partner-components/ConsignmentHistory";
import ConsultationAppointment from "@/components/partner-components/ConsultationAppointment";
import EnrollmentHistory from "@/components/partner-components/EnrollmentHistory";
import OrderHistory from "@/components/partner-components/OrderHistory";
import PersonalInfor from "@/components/partner-components/PersonalInfor";
import PurchaseHistory from "@/components/partner-components/PurchaseHistory";
import TherapyAppointment from "@/components/partner-components/TherapyAppointment";
import PageTitle from "@/components/Title";
import { Tabs, TabsTrigger, TabsList, TabsContent } from "@/components/ui/tabs";
import { handleAxiosError } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
type PartnerDetailProps = {
  isUseTitle?: boolean;
};
const PartnerDetail = ({ isUseTitle = true }: PartnerDetailProps) => {
  const { partnerType, id } = useParams();
  const [notFound, setNotFound] = useState(false);

  const fetchData = async () => {
    try {
      const response = await api.get(`partners/${id}`);
      const tmp = partnerType === "customers" ? "Customer" : "Supplier";

      if (response.data.partner.type !== tmp) setNotFound(true);
    } catch (error) {
      setNotFound(true);
      handleAxiosError(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (notFound)
    return (
      <div className="flex justify-center items-center w-full h-full">
        <h1 className="font-semibold text-2xl">
          {partnerType?.slice(0, -1).toUpperCase()} NOT FOUND!
        </h1>
      </div>
    );

  return (
    <div className="w-full h-full">
      {isUseTitle && <PageTitle title="Partner Detail"></PageTitle>}

      <Tabs defaultValue="Personal Information" className="w-full h-full">
        <TabsList>
          <TabsTrigger value="Personal Information">
            Personal Information
          </TabsTrigger>

          {partnerType === "customers" && (
            <>
              <TabsTrigger value="Therapy Appointment">
                Therapy Appointment
              </TabsTrigger>

              <TabsTrigger value="Consultation Appointment">
                Consultation Appointment
              </TabsTrigger>
            </>
          )}

          {partnerType === "customers" ? (
            <>
              <TabsTrigger value="Order History">Order History</TabsTrigger>
              <TabsTrigger value="Enrollment History">Enrollment</TabsTrigger>
            </>
          ) : (
            <TabsTrigger value="Purchase History">Purchase History</TabsTrigger>
          )}
          <TabsTrigger value="Consignment History">
            Consignment History
          </TabsTrigger>
          <TabsTrigger value="Debt">Debt</TabsTrigger>
        </TabsList>

        <TabsContent value="Personal Information">
          <PersonalInfor partnerId={Number(id)}></PersonalInfor>
        </TabsContent>

        <TabsContent value="Consignment History">
          <ConsignmentHistory
            partnerId={Number(id)}
            partnerType={partnerType === "customers" ? "Customer" : "Supplier"}
          ></ConsignmentHistory>
        </TabsContent>

        <TabsContent value="Order History">
          <OrderHistory customerId={Number(id)}></OrderHistory>
        </TabsContent>

        <TabsContent value="Enrollment History">
          <EnrollmentHistory customerId={Number(id)}></EnrollmentHistory>
        </TabsContent>

        <TabsContent value="Purchase History">
          <PurchaseHistory supplierId={Number(id)}></PurchaseHistory>
        </TabsContent>

        {partnerType === "customers" && (
          <>
            <TabsContent value="Therapy Appointment">
              <TherapyAppointment customerId={Number(id)}></TherapyAppointment>
            </TabsContent>

            <TabsContent value="Consultation Appointment">
              <ConsultationAppointment
                customerId={Number(id)}
              ></ConsultationAppointment>
            </TabsContent>
          </>
        )}

        <TabsContent value="Debt">
          <div>Debt</div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PartnerDetail;
