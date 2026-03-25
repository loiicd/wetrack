"use server";

import { revalidatePath } from "next/cache";

export async function refreshDashboard(dashboardId: string): Promise<void> {
  revalidatePath(`/dashboard/${dashboardId}`);
}
