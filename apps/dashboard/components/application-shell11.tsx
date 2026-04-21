import { ThemeToggle } from "@/components/theme-toggle";
import * as React from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarInset,
  SidebarMenu,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { SiteHeader } from "./site-header";
import { Suspense } from "react";
import {
  PrimaryNavigationMobile,
  PrimaryNavigationSidebar,
} from "./layout/primaryNavigation";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";



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
              <OrganizationSwitcher />
            </SidebarMenu>
          </SidebarGroup>
          <Suspense fallback={null}>
            <PrimaryNavigationSidebar />
          </Suspense>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}

function MobileHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4 md:hidden">
      <a href="#" className="flex items-center gap-2">
        <span className="text-lg font-semibold tracking-tight">WeTrack</span>
      </a>
      <div className="flex items-center gap-1">
        <ThemeToggle />
      </div>
    </header>
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
        <SiteHeader userSlot={<UserButton showName />} />
        <div className="hidden flex-1 pt-(--header-height) md:flex">
          <AppSidebar />
          <SidebarInset>{children}</SidebarInset>
        </div>
        <div className="flex flex-col md:hidden">
          <MobileHeader />
          <div className="pb-16">{children}</div>
          <Suspense fallback={null}>
            <PrimaryNavigationMobile />
          </Suspense>
        </div>
      </SidebarProvider>
    </div>
  );
}
