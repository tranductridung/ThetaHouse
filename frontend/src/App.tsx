import Layout from "@/pages/Layout";
import Room from "@/pages/room.page";
import User from "@/pages/user.page";
import Item from "@/pages/item.page";
import Order from "@/pages/order.page";
import Module from "@/pages/module.page";
import Course from "@/pages/course.page";
import Product from "@/pages/product.page";
import Partner from "@/pages/partner.page";
import Service from "@/pages/service.page";
import Payment from "@/pages/payment.page";
import Login from "@/pages/Auth/login.page";
import Calendar from "@/pages/calendar.page";
import Discount from "@/pages/discount.page";
import Purchase from "@/pages/purchase.page";
import PublicRoute from "@/auth/PublicRoute";
import SourcePage from "@/pages/source.page";
import Signup from "@/pages/Auth/signup.page";
import NotFound from "@/pages/error-pages/not-found.page";
import Dashboard from "@/pages/dashboard.page";
import Inventory from "@/pages/inventory.page";
import { Toaster } from "@/components/ui/sonner";
import Enrollment from "@/pages/enrollment.page";
import { AuthProvider } from "@/auth/AuthContext";
import ProtectedRoute from "@/auth/ProtectedRoute";
import Consignment from "@/pages/consignment.page";
import Transaction from "@/pages/transaction.page";
import Appointment from "@/pages/appointment.page";
import CourseStaff from "@/pages/course-staff.page";
import CreateOrder from "@/pages/create-order.page";
import RolePermission from "./pages/role-permission";
import OrderDetails from "@/pages/order-detail.page";
import CourseDetail from "@/pages/course-detail.page";
import PartnerDetail from "@/pages/partner-detail.page";
import CreatePurchase from "@/pages/create-purchase.page";
import PurchaseDetails from "@/pages/purchase-detail.page";
import Forbidden from "@/pages/error-pages/forbidden.page";
import { Routes, Route, Navigate } from "react-router-dom";
import ResetPassword from "@/pages/Auth/reset-password.page";
import ForgotPassword from "@/pages/Auth/forgot-password.page";
import CreateConsignment from "@/pages/create-consignment.page";
import ConsignmentDetails from "@/pages/consignment-detail.page";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route element={<ProtectedRoute />}>
            <Route index element={<Navigate to="/dashboard" replace />} />

            <Route path="courses" element={<Course />} />
            <Route path="courses/staff" element={<CourseStaff />} />
            <Route path="courses/:id" element={<CourseDetail />} />

            <Route path="items" element={<Item />} />
            <Route path="users" element={<User />} />
            <Route path="services" element={<Service />} />
            <Route path="products" element={<Product />} />
            <Route path="calendars" element={<Calendar />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="enrollments" element={<Enrollment />} />
            <Route path="appointments" element={<Appointment />} />

            <Route path="finance/payments" element={<Payment />} />
            <Route path="finance/transactions" element={<Transaction />} />

            <Route path="resources/rooms" element={<Room />} />
            <Route path="resources/modules" element={<Module />} />
            <Route path="resources/discounts" element={<Discount />} />

            <Route
              path="settings/roles-permissions"
              element={<RolePermission />}
            />

            <Route path="partners" element={<Partner />} />
            <Route
              path="partners/:partnerType/:id"
              element={<PartnerDetail />}
            />

            <Route path="sources" element={<SourcePage />}>
              <Route path="orders" element={<Order />} />
              <Route path="purchases" element={<Purchase />} />
              <Route path="consignments" element={<Consignment />} />

              <Route path="orders/:id" element={<OrderDetails />} />
              <Route path="purchases/:id" element={<PurchaseDetails />} />
              <Route path="consignments/:id" element={<ConsignmentDetails />} />

              <Route path="orders/create" element={<CreateOrder />} />
              <Route path="purchases/create" element={<CreatePurchase />} />
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
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        </Route>

        <Route path="/errors/forbidden" element={<Forbidden />} />

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
