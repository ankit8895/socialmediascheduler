import React from "react";
import AppSidebar from "./_common/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/8bitcn/sidebar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-sidebar! border-none">
        <div className="m-1 px-4 rounded-lg border border-border dark:border-[#e0e1e11a] shadow-xs bg-background h-full">
          <div className="py-2 px-3">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
