/**
 * Feature Gate helper using Clerk's has() function.
 * Checks whether the current org has an active subscription feature.
 *
 * Usage in Server Components:
 *   const canDeploy = await checkFeature("feature:deploy");
 *   if (!canDeploy) redirect("/settings/billing");
 *
 * Plans are configured in the Clerk Dashboard → Billing → Plans.
 * Assign features to plans (e.g. "feature:deploy", "feature:unlimited_dashboards").
 */

import { auth } from "@clerk/nextjs/server";

export type WeTrackFeature =
  | "feature:deploy"
  | "feature:unlimited_dashboards"
  | "feature:credential_vault";

export async function checkFeature(feature: WeTrackFeature): Promise<boolean> {
  try {
    const { has } = await auth();
    return has({ feature });
  } catch {
    if (process.env.NODE_ENV === "production") {
      // In production, fail safe: deny access if billing check fails
      return false;
    }
    // In development/staging, allow access if Clerk Billing is not configured
    return true;
  }
}

export async function requireFeature(feature: WeTrackFeature): Promise<void> {
  const allowed = await checkFeature(feature);
  if (!allowed) {
    const { redirect } = await import("next/navigation");
    redirect("/settings/billing" as never);
  }
}
