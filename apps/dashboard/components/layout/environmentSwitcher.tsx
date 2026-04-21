"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Check } from "lucide-react";
import type { Route } from "next";

type EnvEntry = {
  id: string;
  environment: "PRODUCTION" | "STAGING" | "DEVELOPMENT";
  isCurrent: boolean;
};

const ENV_LABEL: Record<string, string> = {
  PRODUCTION: "Production",
  STAGING: "Staging",
  DEVELOPMENT: "Development",
};

const ENV_VARIANT: Record<
  string,
  "default" | "secondary" | "outline"
> = {
  PRODUCTION: "default",
  STAGING: "secondary",
  DEVELOPMENT: "outline",
};

export function EnvironmentSwitcher() {
  const params = useParams<{ dashboardId?: string }>();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [envs, setEnvs] = useState<EnvEntry[]>([]);

  const dashboardId = params?.dashboardId;
  const current = envs.find((e) => e.isCurrent);

  useEffect(() => {
    if (!dashboardId) {
      setEnvs([]);
      return;
    }
    fetch(`/api/dashboard/${dashboardId}/environments`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: EnvEntry[]) => setEnvs(data))
      .catch(() => setEnvs([]));
  }, [dashboardId]);

  // Only render when we're on a dashboard page with multiple environments
  if (!dashboardId || envs.length <= 1) return null;

  return (
    <>
      {/* Separator */}
      <span className="text-border mx-2 select-none">/</span>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 px-2 text-sm font-medium"
            >
              <Badge
                variant={ENV_VARIANT[current?.environment ?? "PRODUCTION"]}
                className="h-5 text-xs"
              >
                {ENV_LABEL[current?.environment ?? "PRODUCTION"]}
              </Badge>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </Button>
          }
        />
        <DropdownMenuContent align="start" className="w-44">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Environment
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {envs.map((env) => (
            <DropdownMenuItem
              key={env.id}
              onSelect={() => {
                startTransition(() => {
                  router.push(`/dashboard/${env.id}` as Route);
                });
              }}
              className="flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <Badge
                  variant={ENV_VARIANT[env.environment]}
                  className="h-5 text-xs"
                >
                  {ENV_LABEL[env.environment]}
                </Badge>
              </div>
              {env.isCurrent && (
                <Check className="size-3.5 text-muted-foreground" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
