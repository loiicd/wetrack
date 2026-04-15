import { getInfisicalClient, getProjectId, getEnvironment, getSecretPath } from "@/lib/vault/infisical";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

type Params = { params: Promise<{ label: string }> };

export const DELETE = async (_req: NextRequest, { params }: Params) => {
  const { orgId } = await auth();
  if (!orgId) return new NextResponse("Organization required", { status: 403 });

  const { label } = await params;
  const decodedLabel = decodeURIComponent(label);

  try {
    const client = await getInfisicalClient();
    await client.secrets().deleteSecret(decodedLabel, {
      projectId: getProjectId(),
      environment: getEnvironment(),
      secretPath: getSecretPath(orgId),
    });
  } catch {
    return NextResponse.json({ error: "Credential not found" }, { status: 404 });
  }

  // Invalidate caches that referenced this credential
  revalidateTag(`credential:${orgId}:${decodedLabel}`, "max");

  return new NextResponse(null, { status: 204 });
};
