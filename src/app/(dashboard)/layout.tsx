import type { ReactNode } from "react";

import { Menu } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";

import DashboardSidebar from "./_components/sidebar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <div className="relative">
          <div className="md:hidden absolute top-4 left-4 z-10">
            <SidebarTrigger>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open sidebar</span>
              </Button>
            </SidebarTrigger>
          </div>
          <div className="pt-16 md:pt-0">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
