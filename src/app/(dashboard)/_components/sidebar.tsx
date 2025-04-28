"use client";

import {
  BarChartIcon,
  CreditCardIcon,
  HistoryIcon,
  HomeIcon,
  SettingsIcon,
} from "lucide-react";

import { Separator } from "~/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "~/components/ui/sidebar";

import SidebarLogo from "./sidebar-logo";
import SidebarNav from "./sidebar-nav";
import NavUser from "./user-nav";

const mainNavLinks = [
  {
    name: "Dashboard",
    url: "/",
    icon: HomeIcon,
  },
  {
    name: "Analytics",
    url: "/analytics",
    icon: BarChartIcon,
  },
  {
    name: "History",
    url: "/history",
    icon: HistoryIcon,
  },
];

const secondaryNavLinks = [
  {
    name: "Billing",
    url: "/billing",
    icon: CreditCardIcon,
  },
  {
    name: "Settings",
    url: "/settings",
    icon: SettingsIcon,
  },
];

export default function DashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarLogo />
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <SidebarNav title="Main" links={mainNavLinks} />
        <Separator />
        <SidebarNav title="Secondary" links={secondaryNavLinks} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
