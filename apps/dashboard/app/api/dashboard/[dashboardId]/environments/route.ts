import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { dashboardInterface } from "@/lib/database/dashboard";

export const GET = async (
  _req: Request,
  { params }: { params: Promise<{ dashboardId: string }> },
) => {
  const { orgId } = await auth();
  if (!orgId) return new NextResponse("Organization required", { status: 403 });

  const { dashboardId } = await params;
  const dashboard = await dashboardInterface.getById(dashboardId);

  if (!dashboard || dashboard.stack?.orgId !== orgId) {
    return new NextResponse("Not found", { status: 404 });
  }

  const environments = await dashboardInterface.getEnvironmentsByKey(
    dashboard.key,
    orgId,
  );

  return NextResponse.json(
    environments.map((e) => ({
      id: e.id,
      environment: e.stack!.environment,
      isCurrent: e.id === dashboardId,
    })),
  );
};
