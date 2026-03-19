"use client";

import {
  Menu,
  Search,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { useSidebar } from "@/components/ui/sidebar";

export function SiteHeader({ userSlot }: { userSlot?: React.ReactNode }) {
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
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-sm bg-primary">
            <img
              src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblocks-logo.svg"
              alt="Shadcnblocks"
              className="size-5 invert dark:invert-0"
            />
          </div>
          <span className="hidden text-lg font-semibold sm:block">WeTrack</span>
        </Link>
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
        {userSlot}
      </div>
    </header>
  );
}
