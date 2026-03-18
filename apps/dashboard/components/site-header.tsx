"use client";

import {
  BadgeCheck,
  Bell,
  ChevronDown,
  CreditCard,
  LogOut,
  Menu,
  Search,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

import { getInitials } from "@/lib/utils";

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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { useSidebar } from "@/components/ui/sidebar";

const user = {
  name: "Max Mustermann",
  email: "max@zerotube.io",
  avatar:
    "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar/avatar1.jpg",
};

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="fixed top-0 z-50 hidden w-full items-center border-b bg-background md:flex">
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
          <span className="hidden text-lg font-semibold sm:block">WeTrack</span>
        </a>
      </div>

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

      <div className="flex h-(--header-height) items-center gap-1 px-4">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="flex h-auto items-center gap-2 px-2 py-1"
              />
            }
          >
            <Avatar className="size-8">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <span className="hidden font-medium sm:inline">{user.name}</span>
            <ChevronDown className="size-3 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
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
