"use server";

import { chartInterface } from "@/lib/database/chart";
import { revalidatePath, revalidateTag } from "next/cache";

export async function refreshDashboard(dashboardId: string): Promise<void> {
  const charts = await chartInterface.getByDashboardId(dashboardId);

  for (const chart of charts) {
    if (chart.queryId) {
      revalidateTag(`query:${chart.queryId}`);
    }
    // Also invalidate the datasource cache so the actual HTTP call is re-made
    if (chart.query?.dataSourceId) {
      revalidateTag(`datasource:${chart.query.dataSourceId}`);
    }
  }

  revalidatePath(`/dashboard/${dashboardId}`);
}
