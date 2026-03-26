"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { refreshDashboard } from "@/actions/dashboard/refresh";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

type RefreshInterval = "30" | "60" | "300" | "900" | "3600" | "off";

const INTERVALS: { value: RefreshInterval; label: string }[] = [
  { value: "30", label: "30s" },
  { value: "60", label: "1 min" },
  { value: "300", label: "5 min" },
  { value: "900", label: "15 min" },
  { value: "3600", label: "1 h" },
  { value: "off", label: "Aus" },
];

type Props = {
  dashboardId: string;
};

const RefreshDashboardButton = ({ dashboardId }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [interval, setInterval_] = useState<RefreshInterval>("300");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const doRefresh = () => {
    startTransition(async () => {
      await refreshDashboard(dashboardId);
      router.refresh();
    });
  };

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (interval === "off") return;

    const ms = parseInt(interval, 10) * 1000;
    timerRef.current = setInterval(() => {
      if (document.visibilityState === "visible") {
        doRefresh();
      }
    }, ms);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interval, dashboardId]);

  return (
    <div className="flex items-center gap-1">
      <RefreshCw
        className={`w-3.5 h-3.5 text-muted-foreground ${isPending ? "animate-spin" : ""}`}
      />
      <Select value={interval} onValueChange={(v) => setInterval_(v as RefreshInterval)}>
        <SelectTrigger className="h-8 w-[80px] text-xs border-dashed">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {INTERVALS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-xs">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default RefreshDashboardButton;
