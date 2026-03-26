"use server";

import { chartInterface } from "@/lib/database/chart";
import { revalidatePath, revalidateTag } from "next/cache";

export async function refreshDashboard(dashboardId: string): Promise<void> {
  // Revalidate all chart data caches for this dashboard
  const charts = await chartInterface.getByDashboardId(dashboardId);
  for (const chart of charts) {
    if (chart.queryId) {
      revalidateTag(`query:${chart.queryId}`);
    }
  }

  // Also revalidate the page path for any server-side data
  revalidatePath(`/dashboard/${dashboardId}`);
}
