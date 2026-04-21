import { stackSyncSchema } from "@/schemas/dashboard";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { mainWorkflow } from "@/lib/workflows/main";
// import { checkFeature } from "@/lib/billing/featureGate";
import { revalidateTag, revalidatePath } from "next/cache";
import { chartInterface } from "@/lib/database/chart";
import { dashboardInterface } from "@/lib/database/dashboard";
import { stackInterface } from "@/lib/database/stack";
import { dataSourceInterface } from "@/lib/database/dataSource";
import { queryInterface } from "@/lib/database/query";
import type { ChartType } from "@/generated/prisma/enums";
import type { QueryType } from "@/generated/prisma/enums";

function mapChartType(type: ChartType): string {
  switch (type) {
    case "STAT": return "stat";
    case "CLOCK": return "clock";
    default: return "cartesian"; // CARTESIAN, BAR, LINE
  }
}

function mapQueryType(type: QueryType): string {
  switch (type) {
    case "SQL": return "sql";
    default: return "jsonpath";
  }
}

export const GET = async (request: NextRequest) => {
  console.log("[GET /api/dashboard] Request received");

  const response = await auth({ acceptsToken: ["api_key"] });

  if (!response.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = response.orgId;
  if (!orgId) {
    return new NextResponse("Organization required", { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  const env = searchParams.get("env");

  if (!key || !env) {
    return NextResponse.json({ error: "Missing required query params: key, env" }, { status: 400 });
  }

  const stack = await stackInterface.getByKeyAndEnv(key, env, orgId);
  if (!stack) {
    return NextResponse.json({ error: "Stack not found" }, { status: 404 });
  }

  const [dashboards, dataSources, queries, charts] = await Promise.all([
    dashboardInterface.getByStackId(stack.id),
    dataSourceInterface.getByStackId(stack.id),
    queryInterface.getByStackId(stack.id),
    chartInterface.getByStackId(stack.id),
  ]);

  const dashboardKeyById = new Map(dashboards.map((d) => [d.id, d.key]));
  const dataSourceKeyById = new Map(dataSources.map((ds) => [ds.id, ds.key]));
  const queryKeyById = new Map(queries.map((q) => [q.id, q.key]));

  return NextResponse.json({
    key: stack.key,
    environment: stack.environment,
    dashboards: dashboards.map((d) => ({
      key: d.key,
      label: d.label,
      description: d.description ?? null,
    })),
    dataSources: dataSources.map((ds) => ({
      key: ds.key,
      type: ds.type,
      config: ds.config,
    })),
    queries: queries.map((q) => {
      const base = {
        key: q.key,
        type: mapQueryType(q.type),
        dataSource: q.dataSourceId ? (dataSourceKeyById.get(q.dataSourceId) ?? undefined) : undefined,
        sourceQuery: q.sourceQueryId ? (queryKeyById.get(q.sourceQueryId) ?? undefined) : undefined,
      };
      if (q.type === "JSONPATH") return { ...base, jsonPath: q.jsonPath };
      return { ...base, sql: q.sql };
    }),
    charts: charts.map((c) => ({
      key: c.key,
      dashboard: dashboardKeyById.get(c.dashboardId) ?? c.dashboardId,
      label: c.label,
      description: c.description ?? undefined,
      type: mapChartType(c.type),
      config: c.config,
      query: c.queryId ? (queryKeyById.get(c.queryId) ?? undefined) : undefined,
      layout: { x: c.layoutX, y: c.layoutY, w: c.layoutW, h: c.layoutH },
    })),
  });
};

export const POST = async (request: NextRequest) => {
  console.log("[POST /api/dashboard] Request received");

  const response = await auth({
    acceptsToken: ["api_key"],
  });

  console.log(
    "[POST /api/dashboard] Authentication check complete, isAuthenticated:",
    response.isAuthenticated,
  );

  if (!response.isAuthenticated) {
    console.warn("[POST /api/dashboard] Unauthorized request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = response.orgId;
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

  const parsed = stackSyncSchema.safeParse(body);
  if (!parsed.success) {
    console.error(
      "[POST /api/dashboard] Full stack validation failed:",
      parsed.error.issues,
    );
    return NextResponse.json(
      {
        error:
          "Validation failed. POST /api/dashboard expects a complete stack snapshot with dashboards, dataSources, queries, and charts arrays.",
        issues: parsed.error.issues,
      },
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
