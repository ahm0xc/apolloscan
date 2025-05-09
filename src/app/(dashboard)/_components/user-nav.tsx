"use client";

import Link from "next/link";

import { useAuth, useUser } from "@clerk/nextjs";
import {
  BadgeCheck,
  ChevronsUpDown,
  CreditCard,
  Crown,
  LogOut,
  Sparkles,
  UserIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { buttonVariants } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";
import { useSubscription } from "~/hooks/use-subscription";
import { cn } from "~/lib/utils";

export default function NavUser() {
  const { isMobile } = useSidebar();
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const { isSubscribed } = useSubscription();

  function handleSignOut() {
    signOut();
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {!isSignedIn && (
          // TODO: open auth modal
          <Link
            href="/sign-up"
            className={cn(
              buttonVariants({ size: "lg" }),
              "w-full rounded-xl",
              "group-data-[state=collapsed]:w-auto group-data-[state=collapsed]:aspect-square group-data-[state=collapsed]:p-0 group-data-[state=collapsed]:size-8"
            )}
          >
            <UserIcon className="group-data-[state=collapsed]:block hidden" />
            <span className="group-data-[state=collapsed]:hidden">
              Sign Up For Free
            </span>
          </Link>
        )}
        {isSignedIn && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg" asChild>
                <div className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <div className="relative">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user?.imageUrl} alt="" />
                      <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                    </Avatar>
                    {isSubscribed && (
                      <Crown className="absolute -right-1 -top-1 h-4 w-4 rotate-12 text-yellow-500 fill-yellow-500 animate-pulse drop-shadow-[0_0_4px_rgba(234,179,8,0.8)] hover:scale-110 transition-transform" />
                    )}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold flex items-center gap-1">
                      {user?.fullName}
                      {isSubscribed && (
                        <span className="text-[10px] font-medium bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-yellow-700 px-1.5 rounded-full border border-yellow-500/20">
                          PRO
                        </span>
                      )}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.emailAddresses[0]?.emailAddress}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </div>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <div className="relative">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user?.imageUrl} alt="" />
                      <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                    </Avatar>
                    {isSubscribed && (
                      <Crown className="absolute -right-1 -top-1 h-4 w-4 rotate-12 text-yellow-500 fill-yellow-500 animate-pulse drop-shadow-[0_0_4px_rgba(234,179,8,0.8)] hover:scale-110 transition-transform" />
                    )}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold flex items-center gap-1">
                      {user?.fullName}
                      {isSubscribed && (
                        <span className="text-[10px] font-medium bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-yellow-700 px-1.5 rounded-full border border-yellow-500/20">
                          PRO
                        </span>
                      )}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.emailAddresses[0]?.emailAddress}
                    </span>
                  </div>
                </div>
                {isSubscribed && (
                  <div className="mt-1 px-1 py-1 bg-gradient-to-r from-amber-500/5 via-yellow-500/5 to-amber-500/5 rounded-md border border-yellow-500/10">
                    <div className="flex items-center gap-1 text-xs text-yellow-700">
                      <Sparkles className="h-3 w-3" />
                      <span>Active Pro Subscription</span>
                    </div>
                  </div>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {!isSubscribed && (
                <>
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/pricing"
                        className="bg-yellow-800/10 border border-yellow-800/20 hover:!bg-yellow-800/20"
                      >
                        <Sparkles className="text-yellow-500 fill-yellow-500" />
                        Upgrade to Pro
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <BadgeCheck />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreditCard />
                  Billing
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="border border-transparent hover:!bg-red-800/10 hover:!text-red-800"
                onClick={handleSignOut}
              >
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
