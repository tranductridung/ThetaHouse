import { Outlet } from "react-router-dom";
import { SiteHeader } from "@/components/site-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { LoadingProvider } from "@/components/contexts/loading.context";

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset"></AppSidebar>
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 relative flex-col mt-3">
          <LoadingProvider>
            <Outlet></Outlet>
          </LoadingProvider>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
