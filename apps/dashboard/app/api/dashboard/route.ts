import { stackSchema } from "@/schemas/dashboard";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { mainWorkflow } from "@/lib/workflows/main";
import { checkFeature } from "@/lib/billing/featureGate";

export const POST = async (request: NextRequest) => {
  const { orgId } = await auth();

  if (!orgId) {
    return new NextResponse("Organization required", { status: 403 });
  }

  const canDeploy = await checkFeature("feature:deploy");
  if (!canDeploy) {
    return NextResponse.json(
      { error: "Plan upgrade required. Visit /settings/billing to upgrade." },
      { status: 402 },
    );
  }

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

  try {
    await mainWorkflow(parsed.data, orgId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return new NextResponse("Ok", { status: 200 });
};
