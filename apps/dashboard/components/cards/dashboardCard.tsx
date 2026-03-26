import Link from "next/link";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Clock, LayoutDashboard, ChevronRight } from "lucide-react";
import type { Environment } from "@/generated/prisma/client";

type DashboardWithStack = {
  id: string;
  label: string;
  description: string | null;
  updatedAt: Date;
  stack?: {
    environment: Environment;
    key: string;
  };
};

type Props = {
  dashboard: DashboardWithStack;
};

const ENV_BADGE: Record<Environment, { label: string; variant: "default" | "secondary" | "outline" }> = {
  PRODUCTION: { label: "Production", variant: "default" },
  STAGING: { label: "Staging", variant: "secondary" },
  DEVELOPMENT: { label: "Development", variant: "outline" },
};

const DashboardCard = ({ dashboard }: Props) => {
  const env = dashboard.stack?.environment;
  const badge = env ? ENV_BADGE[env] : null;

  return (
    <Link href={`/dashboard/${dashboard.id}`}>
      <Card className="group flex flex-row items-center gap-4 px-4 py-4 border-l-4 border-l-primary cursor-pointer hover:shadow-md transition-shadow">
        <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
          <LayoutDashboard className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm truncate">{dashboard.label}</p>
            {badge && (
              <Badge variant={badge.variant} className="text-[10px] px-1.5 py-0 h-4">
                {badge.label}
              </Badge>
            )}
          </div>
          {dashboard.description ? (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {dashboard.description}
            </p>
          ) : null}
          <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
            <Clock className="w-3 h-3 shrink-0" />
            <span className="text-xs">
              {dashboard.updatedAt.toLocaleDateString("de-DE")},{" "}
              {dashboard.updatedAt.toLocaleTimeString("de-DE", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
      </Card>
    </Link>
  );
};

export default DashboardCard;
