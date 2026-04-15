import { getInfisicalClient, getProjectId, getEnvironment, getSecretPath, isInfisicalConfigured, parseCredentialMeta, ensureOrgFolder } from "@/lib/vault/infisical";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";

const createSchema = z.object({
  label: z.string().min(1).max(100),
  type: z.enum(["api-key", "bearer", "basic", "header"]),
  value: z.string().min(1),
  headerName: z.string().optional(),
});

export const GET = async () => {
  const { orgId } = await auth();
  if (!orgId) return new NextResponse("Organization required", { status: 403 });

  if (!isInfisicalConfigured()) {
    return NextResponse.json([]);
  }

  const client = await getInfisicalClient();
  let secrets: { secretKey: string; secretComment?: string; createdAt: string; updatedAt: string }[] = [];
  try {
    const response = await client.secrets().listSecrets({
      projectId: getProjectId(),
      environment: getEnvironment(),
      secretPath: getSecretPath(orgId),
    });
    secrets = response.secrets;
  } catch {
    // Folder doesn't exist yet (org has no credentials) — return empty list
    secrets = [];
  }

  const credentials = secrets.map((secret) => {
    const meta = parseCredentialMeta(secret.secretComment);
    return {
      secretKey: secret.secretKey,
      type: meta.type,
      headerName: meta.headerName ?? null,
      createdAt: secret.createdAt,
      updatedAt: secret.updatedAt,
    };
  });

  return NextResponse.json(credentials);
};

export const POST = async (request: NextRequest) => {
  const { orgId } = await auth();
  if (!orgId) return new NextResponse("Organization required", { status: 403 });

  if (!isInfisicalConfigured()) {
    return NextResponse.json(
      { error: "Infisical is not configured. Set INFISICAL_CLIENT_ID, INFISICAL_CLIENT_SECRET, and INFISICAL_PROJECT_ID environment variables." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  const { label, type, value, headerName } = parsed.data;

  const meta: Record<string, string> = { type };
  if (headerName) {
    meta.headerName = headerName;
  }

  const client = await getInfisicalClient();
  await ensureOrgFolder(orgId);
  await client.secrets().createSecret(label, {
    secretValue: value,
    secretComment: JSON.stringify(meta),
    projectId: getProjectId(),
    environment: getEnvironment(),
    secretPath: getSecretPath(orgId),
  });

  // Invalidate caches that reference this credential
  revalidateTag(`credential:${orgId}:${label}`, "max");

  return NextResponse.json(
    { label, type },
    { status: 201 },
  );
};
