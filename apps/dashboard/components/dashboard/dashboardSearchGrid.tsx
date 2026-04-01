"use client";

import { useState } from "react";
import DashboardCard from "@/components/cards/dashboardCard";
import DashboardsEmptyState from "@/components/home/dashboardsEmptyState";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { Environment } from "@/generated/prisma/client";

type Dashboard = {
  id: string;
  label: string;
  description: string | null;
  updatedAt: Date;
  stack?: { environment: Environment; key: string };
};

type Props = {
  dashboards: Dashboard[];
};

const DashboardSearchGrid = ({ dashboards }: Props) => {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? dashboards.filter(
        (d) =>
          d.label.toLowerCase().includes(query.toLowerCase()) ||
          d.description?.toLowerCase().includes(query.toLowerCase()) ||
          d.stack?.key.toLowerCase().includes(query.toLowerCase()),
      )
    : dashboards;

  if (dashboards.length === 0) {
    return <DashboardsEmptyState />;
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Dashboard suchen…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Kein Dashboard gefunden für &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((dashboard) => (
            <DashboardCard key={dashboard.id} dashboard={dashboard} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardSearchGrid;
