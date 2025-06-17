import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "@/pages/Layout";
import Login from "@/pages/Auth/Login";
import Signup from "@/pages/Auth/Signup";
import Dashboard from "@/pages/Dashboard";
import Product from "@/pages/Product";
import Service from "@/pages/Service";
import Appointment from "@/pages/Appointment";
import Consignment from "@/pages/Consignment";
import Order from "@/pages/Order";
import Purchase from "@/pages/Purchase";
import Inventory from "@/pages/Inventory";
import Module from "@/pages/Module";
import Room from "@/pages/Room";
import Partner from "@/pages/Partner";
import User from "@/pages/User";
import Transaction from "@/pages/Transaction";
import Payment from "@/pages/Payment";
import Item from "@/pages/Item";
import { Toaster } from "./components/ui/sonner";
import SourcePage from "./pages/SourcePage";
import Discount from "./pages/Discount";
import OrderDetails from "./pages/OrderDetails";
import PurchaseDetails from "./pages/PurchaseDetails";
import ConsignmentDetails from "./pages/ConsignmentDetails";
import CreatePurchase from "./pages/CreatePurchase";
import CreateOrder from "./pages/CreateOrder";
import CreateConsignment from "./pages/CreateConsignment";

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="services" element={<Service />} />
            <Route path="products" element={<Product />} />
            <Route path="partners" element={<Partner />} />
            <Route path="users" element={<User />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="items" element={<Item />} />

            <Route path="appointments/scheduled" element={<Appointment />} />

            <Route path="/finance/payments" element={<Payment />} />
            <Route path="/finance/transactions" element={<Transaction />} />

            <Route path="resources/modules" element={<Module />} />
            <Route path="resources/rooms" element={<Room />} />
            <Route path="resources/discounts" element={<Discount />} />

            <Route path="/sources" element={<SourcePage />}>
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

              {/* <Route path="purchases/edit" element={<PurchaseForm />} />
              <Route path="orders/edit" element={<OrderForm />} />
              <Route path="consignments/edit" element={<ConsignmentForm />} /> */}
            </Route>
          </Route>

          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
        </Routes>
      </Router>

      <Toaster
        swipeDirections={["right", "left"]}
        richColors
        closeButton
      ></Toaster>
    </>
  );
};

export default App;
