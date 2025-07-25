import * as React from "react";
import {
  BoxIcon,
  BuildingIcon,
  CalendarIcon,
  DollarSignIcon,
  GalleryVerticalEnd,
  LayoutDashboardIcon,
  SettingsIcon,
  ShoppingCartIcon,
  UsersIcon,
  WarehouseIcon,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "thetahouse",
    email: "thetahouse@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [{ name: "Acme Inc", logo: GalleryVerticalEnd, plan: "Enterprise" }],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
      isActive: true,
    },

    {
      title: "Solutions",
      url: "/",
      icon: BoxIcon,
      items: [
        { title: "Products", url: "/products" },
        { title: "Services", url: "/services" },
        { title: "Courses", url: "/courses" },
        { title: "Enrollments", url: "/enrollments" },
      ],
    },

    {
      title: "Inventory",
      url: "/inventory",
      icon: WarehouseIcon,
      items: [
        { title: "Stock Levels", url: "/inventory" },
        { title: "Incoming Stock", url: "/inventory/incoming" },
        { title: "Outgoing Stock", url: "/inventory/outgoing" },
      ],
    },
    {
      title: "Source",
      url: "/sources",
      icon: ShoppingCartIcon,
      items: [
        { title: "Orders", url: "/sources/orders" },
        { title: "Purchases", url: "/sources/purchases" },
        { title: "Consignments", url: "/sources/consignments" },
      ],
    },
    {
      title: "Appointments",
      url: "/appointments",
      icon: CalendarIcon,
      isActive: true,
    },
    {
      title: "Partners",
      url: "/partners",
      icon: UsersIcon,
      isActive: true,
    },
    {
      title: "Users",
      url: "/users",
      icon: UsersIcon,
      isActive: true,
    },
    {
      title: "Resources",
      url: "/resources",
      icon: BuildingIcon,
      items: [
        { title: "Rooms", url: "/resources/rooms" },
        { title: "Modules", url: "/resources/modules" },
        { title: "Discounts", url: "/resources/discounts" },
      ],
    },

    {
      title: "Finance & Accounting",
      url: "/finance",
      icon: DollarSignIcon,
      items: [
        { title: "Transactions", url: "/finance/transactions" },
        { title: "Payments", url: "/finance/payments" },
        { title: "Reports", url: "/finance/reports" },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: SettingsIcon,
      items: [
        { title: "Roles & Permissions", url: "/settings/roles" },
        { title: "General", url: "/settings/general" },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
