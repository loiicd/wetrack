"use client";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Workflow", href: "#workflow" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Docs", href: "https://docs.wetrack.dev" },
];

const ACTION_BUTTONS = [
  {
    label: "Log in",
    href: "https://app.wetrack.dev/signIn",
    variant: "ghost" as const,
  },
  {
    label: "Start free",
    href: "https://app.wetrack.dev/signUp",
    variant: "default" as const,
  },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between gap-4">
        <a href="#top" className="group flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-lg bg-linear-to-br from-chart-1 via-chart-2 to-chart-3 text-xs font-bold text-white">
            WT
          </span>
          <div>
            <p className="font-display text-sm font-semibold leading-none">
              WeTrack
            </p>
            <p className="text-muted-foreground text-[11px] tracking-[0.08em] uppercase">
              Dashboard as code
            </p>
          </div>
        </a>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          {ACTION_BUTTONS.map((button) => (
            <a
              key={button.label}
              href={button.href}
              className={cn(
                buttonVariants({ size: "sm", variant: button.variant }),
              )}
            >
              {button.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            className="text-muted-foreground border-border/70 hover:text-foreground inline-flex size-9 items-center justify-center rounded-md border"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label="Open menu"
          >
            {isMenuOpen ? (
              <X className="size-4" />
            ) : (
              <Menu className="size-4" />
            )}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "border-border/60 bg-background/95 overflow-hidden border-t lg:hidden",
          isMenuOpen ? "max-h-[80vh]" : "max-h-0 border-t-0",
        )}
      >
        <div className="container space-y-2 py-4">
          {NAV_LINKS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-muted-foreground hover:text-foreground block rounded-md px-3 py-2 text-sm"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <div className="mt-4 flex gap-2">
            {ACTION_BUTTONS.map((button) => (
              <a
                key={button.label}
                href={button.href}
                className={cn(
                  buttonVariants({
                    variant:
                      button.variant === "ghost" ? "outline" : button.variant,
                  }),
                  "flex-1",
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {button.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
