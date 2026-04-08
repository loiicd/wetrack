import { stackSchema } from "@/schemas/dashboard";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { mainWorkflow } from "@/lib/workflows/main";
// import { checkFeature } from "@/lib/billing/featureGate";
import { revalidateTag, revalidatePath } from "next/cache";
import { chartInterface } from "@/lib/database/chart";
import { dashboardInterface } from "@/lib/database/dashboard";

export const POST = async (request: NextRequest) => {
  const { orgId: clerkOrgId } = await auth();
  const orgId = clerkOrgId ?? process.env.WETRACK_DEFAULT_ORG_ID;

  if (!orgId) {
    return new NextResponse("Organization required", { status: 403 });
  }

  // const canDeploy = await checkFeature("feature:deploy");
  // if (!canDeploy) {
  //   return NextResponse.json(
  //     { error: "Plan upgrade required. Visit /settings/billing to upgrade." },
  //     { status: 402 },
  //   );
  // }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = stackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  let stackId: string;
  try {
    ({ stackId } = await mainWorkflow(parsed.data, orgId));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // Invalidate all caches for the deployed stack so dashboards show fresh data
  try {
    const dashboards = await dashboardInterface.getByStackId(stackId);
    for (const dashboard of dashboards) {
      revalidatePath(`/dashboard/${dashboard.id}`);
      const charts = await chartInterface.getByDashboardId(dashboard.id);
      for (const chart of charts) {
        if (chart.queryId) revalidateTag(`query:${chart.queryId}`, "max");
        if (chart.query?.dataSourceId)
          revalidateTag(`datasource:${chart.query.dataSourceId}`, "max");
      }
    }
    revalidatePath("/dashboard");
  } catch {
    // Cache invalidation is best-effort – don't fail the deploy
  }

  return new NextResponse("Ok", { status: 200 });
};
