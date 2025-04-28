import type { ReactNode } from "react";

import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";

import DashboardSidebar from "./_components/sidebar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <div className="p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
