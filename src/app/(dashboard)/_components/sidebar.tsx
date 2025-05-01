"use client";

import { CreditCardIcon, HistoryIcon, HomeIcon, UserIcon } from "lucide-react";

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
    name: "Home",
    url: "/",
    icon: HomeIcon,
  },
  {
    name: "History",
    url: "/history",
    icon: HistoryIcon,
  },
];

const managementNavLinks = [
  {
    name: "Billing",
    url: "/billing",
    icon: CreditCardIcon,
  },
  {
    name: "Account",
    url: "/account",
    icon: UserIcon,
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
        <SidebarNav title="Management" links={managementNavLinks} />
      </SidebarContent>
      <Separator />
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
