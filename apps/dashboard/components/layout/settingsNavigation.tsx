import Link from "next/link";
import type { Route } from "next";

const SettingsNavigation = () => {
  const items: { label: string; href: Route }[] = [
    { label: "Allgemein", href: "/settings" },
    { label: "Team", href: "/settings/team" },
    { label: "Security", href: "/settings/security" },
  ];

  return (
    <aside className="w-full md:w-56 md:shrink-0">
      <nav className="rounded-lg border bg-card p-2">
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default SettingsNavigation;
