import { stackSchema } from "@/schemas/dashboard";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { mainWorkflow } from "@/lib/workflows/main";
// import { checkFeature } from "@/lib/billing/featureGate";
import { revalidateTag, revalidatePath } from "next/cache";
import { chartInterface } from "@/lib/database/chart";
import { dashboardInterface } from "@/lib/database/dashboard";

export const POST = async (request: NextRequest) => {
  console.log("[POST /api/dashboard] Request received");

  const response = await auth({
    acceptsToken: ["api_key"],
  });

  console.log(
    "[POST /api/dashboard] Authentication check complete, isAuthenticated:",
    response.isAuthenticated,
  );

  // @ts-expect-error Clerk's types are incomplete, so we have to do some manual checks
  console.log("[POST /api/dashboard] Auth claims:", response.claims);
  // @ts-expect-error Clerk's types are incomplete, so we have to do some manual checks
  console.log("[POST /api/dashboard] Auth token type:", response.orgId);

  const token1 = await response.getToken();

  console.log("[POST /api/dashboard] Auth token:", token1);

  if (!response.isAuthenticated) {
    console.warn("[POST /api/dashboard] Unauthorized request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // @ts-expect-error Clerk's types are incomplete, so we have to do some manual checks
  const orgId = token1?.claims?.sub;
  console.log("[POST /api/dashboard] Authenticated orgId:", orgId);

  if (!orgId) {
    console.warn("[POST /api/dashboard] No orgId on API key");
    return new NextResponse("Organization required", { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    console.error("[POST /api/dashboard] Failed to parse request body as JSON");
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = stackSchema.safeParse(body);
  if (!parsed.success) {
    console.error(
      "[POST /api/dashboard] Schema validation failed:",
      parsed.error.issues,
    );
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  console.log(
    "[POST /api/dashboard] Stack validated, running mainWorkflow for stack key:",
    parsed.data.key,
  );

  let stackId: string;
  try {
    ({ stackId } = await mainWorkflow(parsed.data, orgId));
    console.log(
      "[POST /api/dashboard] mainWorkflow completed, stackId:",
      stackId,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[POST /api/dashboard] mainWorkflow error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // Invalidate all caches for the deployed stack so dashboards show fresh data
  try {
    const dashboards = await dashboardInterface.getByStackId(stackId);
    console.log(
      `[POST /api/dashboard] Invalidating cache for ${dashboards.length} dashboard(s)`,
    );
    for (const dashboard of dashboards) {
      revalidatePath(`/dashboard/${dashboard.id}`);
      const charts = await chartInterface.getByDashboardId(dashboard.id);
      console.log(
        `[POST /api/dashboard] Dashboard ${dashboard.id}: invalidating ${charts.length} chart cache(s)`,
      );
      for (const chart of charts) {
        if (chart.queryId) revalidateTag(`query:${chart.queryId}`, "max");
        if (chart.query?.dataSourceId)
          revalidateTag(`datasource:${chart.query.dataSourceId}`, "max");
      }
    }
    revalidatePath("/dashboard");
  } catch (err) {
    // Cache invalidation is best-effort – don't fail the deploy
    console.warn(
      "[POST /api/dashboard] Cache invalidation failed (non-fatal):",
      err,
    );
  }

  console.log("[POST /api/dashboard] Deploy successful");
  return new NextResponse("Ok", { status: 200 });
};
