"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

interface RecentDashboard {
  id: string;
  key: string;
  label: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "gerade eben";
  if (diffMins < 60) return `vor ${diffMins}m`;
  if (diffHours < 24) return `vor ${diffHours}h`;
  if (diffDays < 7) return `vor ${diffDays}d`;
  
  return new Date(date).toLocaleDateString("de-DE");
}

export function RecentDashboards({
  dashboards,
}: {
  dashboards: RecentDashboard[];
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (dashboards.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground mb-4">
          Noch keine Dashboards vorhanden
        </p>
        <Link
          href="/dashboard/create"
          className="inline-flex items-center gap-2 text-primary hover:underline"
        >
          Erstes Dashboard erstellen
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {dashboards.map((dashboard) => (
        <Link
          key={dashboard.id}
          href={`/dashboard/${dashboard.id}`}
          className="group"
        >
          <Card className="h-full p-4 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer">
            <div className="flex flex-col gap-3 h-full">
              <div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  {dashboard.label || dashboard.key}
                </h3>
                {dashboard.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {dashboard.description}
                  </p>
                )}
              </div>

              <div className="mt-auto flex items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {dashboard.key}
                  </Badge>
                </div>
                {mounted && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatTimeAgo(dashboard.updatedAt)}
                  </span>
                )}
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
