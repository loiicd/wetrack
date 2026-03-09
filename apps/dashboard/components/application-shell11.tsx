"use client";

import {
  Baby,
  BadgeCheck,
  Bell,
  ChevronDown,
  ChevronRight,
  Clapperboard,
  Clock,
  CreditCard,
  Download,
  Film,
  Flag,
  HelpCircle,
  History,
  Home,
  ListVideo,
  LogOut,
  type LucideIcon,
  Menu,
  MessageSquare,
  Music,
  Music2,
  PlaySquare,
  Radio,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  ThumbsUp,
} from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
}

const data = {
  user: {
    name: "Jordan Lee",
    email: "jordan@zerotube.io",
    avatar:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar/avatar1.jpg",
  },
  navPrimary: [
    { title: "Home", url: "#", icon: Home, isActive: true },
    { title: "Shorts", url: "#", icon: Clapperboard },
    { title: "Subscriptions", url: "#", icon: PlaySquare },
    { title: "You", url: "#", icon: History },
  ],
  subscriptions: [
    { name: "Theo - t3.gg", avatar: "/avatars/theo.jpg", isLive: true },
    { name: "Fireship", avatar: "/avatars/fireship.jpg", hasNew: true },
    { name: "Web Dev Simplified", avatar: "/avatars/webdev.jpg" },
    { name: "Traversy Media", avatar: "/avatars/traversy.jpg", hasNew: true },
    { name: "The Primeagen", avatar: "/avatars/prime.jpg" },
    { name: "Jack Herrington", avatar: "/avatars/jack.jpg", hasNew: true },
    { name: "Coding in Public", avatar: "/avatars/cip.jpg" },
  ],
  navYou: [
    { title: "History", url: "#", icon: History },
    { title: "Playlists", url: "#", icon: ListVideo },
    { title: "Watch later", url: "#", icon: Clock },
    { title: "Liked videos", url: "#", icon: ThumbsUp },
    { title: "Your videos", url: "#", icon: PlaySquare },
    { title: "Downloads", url: "#", icon: Download },
  ],
  navExplore: [
    { title: "Shopping", url: "#", icon: ShoppingBag },
    { title: "Music", url: "#", icon: Music },
    { title: "Movies", url: "#", icon: Film },
  ],
  navMoreFrom: [
    { title: "Zerotube Studio", url: "#", icon: Radio },
    { title: "Zerotube Music", url: "#", icon: Music2 },
    { title: "Zerotube Kids", url: "#", icon: Baby },
  ],
  navFooter: [
    { title: "Settings", url: "#", icon: Settings },
    { title: "Report history", url: "#", icon: Flag },
    { title: "Help", url: "#", icon: HelpCircle },
    { title: "Send feedback", url: "#", icon: MessageSquare },
  ],
};

// Primary nav (Home, Shorts, Subscriptions, You)
function NavPrimary({
  items,
}: {
  items: { title: string; url: string; icon: LucideIcon; isActive?: boolean }[];
}) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton isActive={item.isActive} tooltip={item.title} render={<a href={item.url} />}><item.icon /><span>{item.title}</span></SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

// Subscriptions section with channel avatars
function NavSubscriptions({
  subscriptions,
}: {
  subscriptions: {
    name: string;
    avatar: string;
    isLive?: boolean;
    hasNew?: boolean;
  }[];
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <Collapsible defaultOpen>
        <SidebarGroupLabel render={<CollapsibleTrigger className="group/collapsible flex w-full items-center" />}>Subscriptions
                          <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" /></SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarMenu>
            {subscriptions.map((channel) => (
              <SidebarMenuItem key={channel.name}>
                <SidebarMenuButton render={<a href="#" />}><Avatar className="size-6 ring-2 ring-muted">
                                          <AvatarImage src={channel.avatar} />
                                          <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                                            {channel.name[0]}
                                          </AvatarFallback>
                                        </Avatar><span className="truncate">{channel.name}</span>{channel.isLive && (
                                          <Radio className="ml-auto size-4 text-red-500" />
                                        )}{channel.hasNew && !channel.isLive && (
                                          <span className="ml-auto size-2 rounded-full bg-blue-500" />
                                        )}</SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
              <SidebarMenuButton>
                <ChevronDown className="size-4" />
                <span>Show more</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  );
}

// "You" section - History, Playlists, etc.
function NavYou({
  items,
}: {
  items: { title: string; url: string; icon: LucideIcon }[];
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <Collapsible defaultOpen>
        <SidebarGroupLabel render={<CollapsibleTrigger className="group/collapsible flex w-full items-center" />}>You
                          <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" /></SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton render={<a href={item.url} />}><item.icon /><span>{item.title}</span></SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
              <SidebarMenuButton>
                <ChevronDown className="size-4" />
                <span>Show more</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  );
}

// Explore section - Shopping, Music, Movies
function NavExplore({
  items,
}: {
  items: { title: string; url: string; icon: LucideIcon }[];
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <Collapsible defaultOpen>
        <SidebarGroupLabel render={<CollapsibleTrigger className="group/collapsible flex w-full items-center" />}>Explore
                          <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" /></SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton render={<a href={item.url} />}><item.icon /><span>{item.title}</span></SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
              <SidebarMenuButton>
                <ChevronDown className="size-4" />
                <span>Show more</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  );
}

// More from Zerotube section
function NavMoreFrom({
  items,
}: {
  items: { title: string; url: string; icon: LucideIcon }[];
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>More from Zerotube</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton render={<a href={item.url} />}><item.icon /><span>{item.title}</span></SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

// Footer nav - Settings, Help, etc.
function NavFooter({
  items,
}: {
  items: { title: string; url: string; icon: LucideIcon }[];
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton size="sm" render={<a href={item.url} />}><item.icon /><span>{item.title}</span></SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

// Footer links at the very bottom
function FooterLinks() {
  return (
    <div className="px-4 py-4 text-xs text-muted-foreground">
      <div className="flex flex-wrap gap-x-2 gap-y-1">
        <a href="#" className="hover:underline">
          About
        </a>
        <a href="#" className="hover:underline">
          Press
        </a>
        <a href="#" className="hover:underline">
          Copyright
        </a>
        <a href="#" className="hover:underline">
          Contact us
        </a>
        <a href="#" className="hover:underline">
          Creators
        </a>
        <a href="#" className="hover:underline">
          Advertise
        </a>
        <a href="#" className="hover:underline">
          Developers
        </a>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1">
        <a href="#" className="hover:underline">
          Terms
        </a>
        <a href="#" className="hover:underline">
          Privacy
        </a>
        <a href="#" className="hover:underline">
          Policy & Safety
        </a>
      </div>
      <p className="mt-3">© 2025 Zerotube</p>
    </div>
  );
}

function SiteHeader() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="fixed top-0 z-50 hidden w-full items-center border-b bg-background md:flex">
      {/* Left: Menu + Logo */}
      <div className="flex h-(--header-height) w-(--sidebar-width-icon) shrink-0 items-center justify-center">
        <Button
          className="size-9"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <Menu className="size-5" />
        </Button>
      </div>
      <div className="flex h-(--header-height) items-center pr-4">
        <a href="#" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-sm bg-primary">
            <img
              src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblocks-logo.svg"
              alt="Shadcnblocks"
              className="size-5 invert dark:invert-0"
            />
          </div>
          <span className="hidden text-lg font-semibold sm:block">
            Shadcnblocks
          </span>
        </a>
      </div>

      {/* Center: Search Bar */}
      <div className="flex flex-1 justify-center px-4">
        <InputGroup className="h-10 max-w-xl rounded-full">
          <InputGroupAddon>
            <Search className="text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput placeholder="Search" />
          <InputGroupAddon align="inline-end">
            <Kbd>⌘K</Kbd>
          </InputGroupAddon>
        </InputGroup>
      </div>

      {/* Right: Avatar */}
      <div className="flex h-(--header-height) items-center gap-1 px-4">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="flex h-auto items-center gap-2 px-2 py-1" />}><Avatar className="size-8">
                                  <AvatarImage src={data.user.avatar} alt={data.user.name} />
                                  <AvatarFallback>{getInitials(data.user.name)}</AvatarFallback>
                                </Avatar><span className="hidden font-medium sm:inline">
                                  {data.user.name}
                                </span><ChevronDown className="size-3 text-muted-foreground" /></DropdownMenuTrigger>
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

function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="icon"
      className="top-(--header-height) hidden h-[calc(100svh-var(--header-height))]! md:flex"
      {...props}
    >
      <SidebarContent className="overflow-hidden">
        <ScrollArea className="min-h-0 flex-1">
          <NavPrimary items={data.navPrimary} />
          <NavSubscriptions subscriptions={data.subscriptions} />
          <NavYou items={data.navYou} />
          <NavExplore items={data.navExplore} />
          <NavMoreFrom items={data.navMoreFrom} />
          <NavFooter items={data.navFooter} />
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className="group-data-[collapsible=icon]:hidden">
        <FooterLinks />
      </SidebarFooter>
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
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-9" />}><Avatar className="size-8">
                                  <AvatarImage src={data.user.avatar} alt={data.user.name} />
                                  <AvatarFallback>{getInitials(data.user.name)}</AvatarFallback>
                                </Avatar></DropdownMenuTrigger>
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
            <button
              key={item.title}
              type="button"
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
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function ContentGrid() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
      </div>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
      </div>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
      </div>
    </div>
  );
}

export function ApplicationShell11() {
  return (
    <div className="w-full [--header-height:calc(--spacing(14))]">
      <SidebarProvider
        className="flex flex-col"
        style={{ "--sidebar-width-icon": "3rem" } as React.CSSProperties}
      >
        {/* Desktop layout */}
        <SiteHeader />
        <div className="hidden flex-1 pt-(--header-height) md:flex">
          <AppSidebar />
          <SidebarInset>
            <ContentGrid />
          </SidebarInset>
        </div>

        {/* Mobile layout */}
        <div className="flex flex-col md:hidden">
          <MobileHeader />
          <div className="pb-16">
            <ContentGrid />
          </div>
          <MobileBottomNav />
        </div>
      </SidebarProvider>
    </div>
  );
}
