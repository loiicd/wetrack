"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Wifi,
  Database,
  Settings2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

type WidgetErrorCardProps = {
  title: string;
  message: string;
};

type ErrorCategory = "network" | "query" | "config" | "unknown";

function categorize(message: string): ErrorCategory {
  const msg = message.toLowerCase();
  if (
    msg.includes("credential") ||
    msg.includes("vault") ||
    msg.includes("headerName")
  )
    return "config";
  if (
    msg.includes("fetch") ||
    msg.includes("network") ||
    msg.includes("econnrefused") ||
    msg.includes("timeout") ||
    msg.includes("http") ||
    msg.includes("url")
  )
    return "network";
  if (
    msg.includes("sql") ||
    msg.includes("query") ||
    msg.includes("column") ||
    msg.includes("table") ||
    msg.includes("alasql") ||
    msg.includes("parse") ||
    msg.includes("syntax")
  )
    return "query";
  if (
    msg.includes("config") ||
    msg.includes("schema") ||
    msg.includes("zod") ||
    msg.includes("invalid") ||
    msg.includes("required") ||
    msg.includes("field")
  )
    return "config";
  return "unknown";
}

const CATEGORY_META: Record<
  ErrorCategory,
  { icon: React.ElementType; label: string; hint: string; colorClass: string }
> = {
  network: {
    icon: Wifi,
    label: "API-Fehler",
    hint: "Die Datenquelle konnte nicht erreicht werden.",
    colorClass: "text-orange-500",
  },
  query: {
    icon: Database,
    label: "Abfrage-Fehler",
    hint: "Die SQL- oder JSONPath-Abfrage ist fehlgeschlagen.",
    colorClass: "text-yellow-600",
  },
  config: {
    icon: Settings2,
    label: "Konfigurations-Fehler",
    hint: "Die Chart-Konfiguration ist ungültig.",
    colorClass: "text-blue-500",
  },
  unknown: {
    icon: AlertTriangle,
    label: "Unbekannter Fehler",
    hint: "Beim Laden des Widgets ist ein Fehler aufgetreten.",
    colorClass: "text-destructive",
  },
};

const WidgetErrorCard = ({ title, message }: WidgetErrorCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const category = categorize(message);
  const { icon: Icon, label, hint, colorClass } = CATEGORY_META[category];

  const handleRefresh = () => {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn("shrink-0", colorClass)}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate text-foreground leading-tight">
              {title}
            </p>
            <p className={cn("text-xs font-medium mt-0.5", colorClass)}>{label}</p>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={handleRefresh}
          disabled={refreshing}
          title="Aktualisieren"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
        </Button>
      </div>

      {/* Hint */}
      <p className="text-sm text-muted-foreground">{hint}</p>

      {/* Details toggle */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        Technische Details
      </button>

      {expanded && (
        <pre className="rounded-md bg-muted/60 border px-3 py-2 font-mono text-xs text-destructive/80 break-all whitespace-pre-wrap overflow-auto flex-1 min-h-0">
          {message}
        </pre>
      )}
    </div>
  );
};

export default WidgetErrorCard;
