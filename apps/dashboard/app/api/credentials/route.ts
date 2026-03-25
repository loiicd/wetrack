import { credentialInterface } from "@/lib/database/credential";
import { encryptSecret } from "@/lib/vault/encryption";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
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

  const credentials = await credentialInterface.getByOrgId(orgId);
  return NextResponse.json(credentials);
};

export const POST = async (request: NextRequest) => {
  const { orgId } = await auth();
  if (!orgId) return new NextResponse("Organization required", { status: 403 });

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

  const encryptedValue = await encryptSecret(value);

  const credential = await credentialInterface.create({
    orgId,
    label,
    type,
    encryptedValue,
    headerName,
  });

  return NextResponse.json(
    { id: credential.id, label: credential.label, type: credential.type },
    { status: 201 },
  );
};
