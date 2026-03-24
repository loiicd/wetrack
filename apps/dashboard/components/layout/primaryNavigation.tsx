"use client";

import { cn } from "@/lib/utils";
import {
  EthernetPortIcon,
  Home,
  LayoutDashboardIcon,
  Search,
  Settings,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems: { title: string; url: Route; icon: LucideIcon }[] = [
  { title: "Home", url: "/", icon: Home },
  { title: "Dashboards", url: "/dashboard", icon: LayoutDashboardIcon },
  { title: "Data Sources", url: "/datasource", icon: EthernetPortIcon },
  { title: "Queries", url: "/query", icon: Search },
  { title: "Settings", url: "/settings", icon: Settings },
];

const isActivePath = (pathname: string, href: string) => {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
};

export const PrimaryNavigationSidebar = () => {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              isActive={isActivePath(pathname, item.url)}
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
};

export const PrimaryNavigationMobile = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur md:hidden">
      <div className="grid grid-cols-5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(pathname, item.url);

          return (
            <Link
              key={item.title}
              href={item.url}
              className={cn(
                "flex flex-col items-center gap-1 py-2 text-xs transition-colors",
                isActive
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
};
