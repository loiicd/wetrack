import {
  BadgeCheck,
  Bell,
  CreditCard,
  Home,
  LogOut,
  type LucideIcon,
  Search,
  Sparkles,
  LayoutDashboardIcon,
  EthernetPortIcon,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import * as React from "react";

import { cn, getInitials } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import Link from "next/link";
import type { Route } from "next";
import UserDropdown from "./userDropdown";
import OrganizationSwitch from "./organizationSwitch";
import { SiteHeader } from "./site-header";
import { Suspense } from "react";
import OrganizationSwitchSkeleton from "./organizationSwitchSkeleton";

const data = {
  user: {
    name: "Max Mustermann",
    email: "max@zerotube.io",
    avatar:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar/avatar1.jpg",
  },
  navPrimary: [
    { title: "Home", url: "/" as Route, icon: Home, isActive: true },
    {
      title: "Dashboards",
      url: "/dashboard" as Route,
      icon: LayoutDashboardIcon,
    },
    {
      title: "Data Sources",
      url: "/datasource" as Route,
      icon: EthernetPortIcon,
    },
    { title: "Queries", url: "/query" as Route, icon: Search },
  ],
};

function NavPrimary({
  items,
}: {
  items: { title: string; url: Route; icon: LucideIcon; isActive?: boolean }[];
}) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              isActive={item.isActive}
              tooltip={item.title}
              render={<Link href={item.url} />}
            >
              <item.icon />
              <span>{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="icon"
      className="top-(--header-height) hidden h-[calc(100svh-var(--header-height))]! md:flex"
      {...props}
    >
      <SidebarContent className="overflow-hidden">
        <ScrollArea className="min-h-0 flex-1">
          <SidebarGroup>
            <SidebarMenu>
              <Suspense fallback={<OrganizationSwitchSkeleton />}>
                <OrganizationSwitch />
              </Suspense>
            </SidebarMenu>
          </SidebarGroup>
          <NavPrimary items={data.navPrimary} />
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}

export const iframeHeight = "800px";

export const description = "A sidebar with a header and a search form.";

function MobileHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4 md:hidden">
      <a href="#" className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-sm bg-primary">
          <img
            src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblocks-logo.svg"
            alt="Shadcnblocks"
            className="size-5 invert dark:invert-0"
          />
        </div>
        <span className="text-lg font-semibold">Shadcnblocks</span>
      </a>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="size-9">
          <Search className="size-5" />
          <span className="sr-only">Search</span>
        </Button>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon" className="size-9" />}
          >
            <Avatar className="size-8">
              <AvatarImage src={data.user.avatar} alt={data.user.name} />
              <AvatarFallback>{getInitials(data.user.name)}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{data.user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {data.user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles className="mr-2 size-4" />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck className="mr-2 size-4" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="mr-2 size-4" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 size-4" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function MobileBottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur md:hidden">
      <div className="grid grid-cols-4">
        {data.navPrimary.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.url}
              className={cn(
                "flex flex-col items-center gap-1 py-2 text-xs transition-colors",
                item.isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-5" />
              <span className="sr-only">{item.title}</span>
              <span aria-hidden="true">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export async function ApplicationShell11({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full [--header-height:calc(--spacing(14))]">
      <SidebarProvider
        className="flex flex-col"
        style={{ "--sidebar-width-icon": "3rem" } as React.CSSProperties}
      >
        <SiteHeader userSlot={<UserDropdown />} />
        <div className="hidden flex-1 pt-(--header-height) md:flex">
          <AppSidebar />
          <SidebarInset>{children}</SidebarInset>
        </div>
        <div className="flex flex-col md:hidden">
          <MobileHeader />
          <div className="pb-16">{children}</div>
          <MobileBottomNav />
        </div>
      </SidebarProvider>
    </div>
  );
}
