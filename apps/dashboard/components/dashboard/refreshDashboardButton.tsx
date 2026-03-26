"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useTransition } from "react";
import { refreshDashboard } from "@/actions/dashboard/refresh";

type Props = {
  dashboardId: string;
};

const RefreshDashboardButton = ({ dashboardId }: Props) => {
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(async () => {
      await refreshDashboard(dashboardId);
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      disabled={isPending}
    >
      <RefreshCw className={`mr-2 h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
      {isPending ? "Aktualisieren…" : "Aktualisieren"}
    </Button>
  );
};

export default RefreshDashboardButton;
