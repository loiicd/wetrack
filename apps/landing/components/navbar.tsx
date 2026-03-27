"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

// NavLink handles both internal paths and external/anchor URLs
const NavLink = ({
  href,
  children,
  className,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => (
  <a href={href} className={className} onClick={onClick}>
    {children}
  </a>
);

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Docs", href: "https://docs.wetrack.dev" },
  { label: "Pricing", href: "#pricing" },
  { label: "GitHub", href: "https://github.com/loiicd/wetrack-dashboard" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky inset-x-0 top-0 z-30 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 md:px-6">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold">W</span>
          WeTrack
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.label}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-2 md:flex">
          <a
            href="https://app.wetrack.dev/signIn"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Log in
          </a>
          <a
            href="https://app.wetrack.dev/signUp"
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get started
          </a>
        </div>

        {/* Mobile burger */}
        <button
          className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-muted md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t bg-background px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-1 pt-3">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </NavLink>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t pt-3">
              <a
                href="https://app.wetrack.dev/signIn"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                Log in
              </a>
              <a
                href="https://app.wetrack.dev/signUp"
                onClick={() => setOpen(false)}
                className="rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Get started
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
