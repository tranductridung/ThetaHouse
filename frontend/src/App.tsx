import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/pages/Layout";
import Login from "@/pages/Auth/Login";
import Signup from "@/pages/Auth/Signup";
import Dashboard from "@/pages/dashboard.page";
import Product from "@/pages/product.page";
import Service from "@/pages/service.page";
import Appointment from "@/pages/appointment.page";
import Consignment from "@/pages/consignment.page";
import Order from "@/pages/order.page";
import Purchase from "@/pages/purchase.page";
import Inventory from "@/pages/inventory.page";
import Module from "@/pages/module.page";
import Room from "@/pages/room.page";
import Partner from "@/pages/partner.page";
import User from "@/pages/user.page";
import Transaction from "@/pages/transaction.page";
import Payment from "@/pages/payment.page";
import Item from "@/pages/item.page";
import { Toaster } from "./components/ui/sonner";
import SourcePage from "./pages/source.page";
import Discount from "./pages/discount.page";
import OrderDetails from "./pages/order-detail.page";
import PurchaseDetails from "./pages/purchase-detail.page";
import ConsignmentDetails from "./pages/consignment-detail.page";
import CreatePurchase from "./pages/create-purchase.page";
import CreateOrder from "./pages/create-order.page";
import CreateConsignment from "./pages/create-consignment.page";
import PartnerDetail from "./pages/partner-detail.page";
import NotFound from "./pages/not-found.page";
import Course from "./pages/course.page";
import Enrollment from "./pages/enrollment.page";
import CourseDetail from "./pages/course-detail.page";
import CourseStaff from "./pages/course-staff.page";
import Test from "./pages/test.page";
import ProtectedRoute from "./auth/ProtectedRoute";
import { AuthProvider } from "./auth/AuthContext";
import PublicRoute from "./auth/PublicRoute";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route element={<ProtectedRoute />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="test" element={<Test />} />

            <Route path="services" element={<Service />} />
            <Route path="products" element={<Product />} />
            <Route path="courses" element={<Course />} />
            <Route path="courses/staff" element={<CourseStaff />} />
            <Route path="courses/:id" element={<CourseDetail />} />
            <Route path="enrollments" element={<Enrollment />} />
            <Route path="partners" element={<Partner />} />
            <Route path="users" element={<User />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="items" element={<Item />} />

            <Route path="appointments" element={<Appointment />} />

            <Route path="finance/payments" element={<Payment />} />
            <Route path="finance/transactions" element={<Transaction />} />

            <Route path="resources/modules" element={<Module />} />
            <Route path="resources/rooms" element={<Room />} />
            <Route path="resources/discounts" element={<Discount />} />

            <Route
              path="partners/:partnerType/:id"
              element={<PartnerDetail />}
            />

            <Route path="sources" element={<SourcePage />}>
              <Route path="purchases" element={<Purchase />} />
              <Route path="orders" element={<Order />} />
              <Route path="consignments" element={<Consignment />} />

              <Route path="orders/:id" element={<OrderDetails />} />
              <Route path="purchases/:id" element={<PurchaseDetails />} />
              <Route path="consignments/:id" element={<ConsignmentDetails />} />

              <Route path="purchases/create" element={<CreatePurchase />} />
              <Route path="orders/create" element={<CreateOrder />} />
              <Route
                path="consignments/create"
                element={<CreateConsignment />}
              />
            </Route>
          </Route>
        </Route>

        {/* Public routes */}
        <Route element={<PublicRoute />}>
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>

      <Toaster
        swipeDirections={["left", "top"]}
        richColors
        closeButton
      ></Toaster>
    </AuthProvider>
  );
};

export default App;
