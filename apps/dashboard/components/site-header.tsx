"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { EnvironmentSwitcher } from "@/components/layout/environmentSwitcher";

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
      <div className="flex flex-1 h-(--header-height) items-center pr-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-sm bg-primary">
            <Image
              src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblocks-logo.svg"
              alt="Shadcnblocks"
              width={20}
              height={20}
              className="size-5 invert dark:invert-0"
            />
          </div>
          <span className="hidden text-lg font-semibold sm:block">WeTrack</span>
        </Link>
        <EnvironmentSwitcher />
      </div>

      <div className="flex h-(--header-height) items-center gap-1 px-4">
        <ThemeToggle />
        {userSlot}
      </div>
    </header>
  );
}
