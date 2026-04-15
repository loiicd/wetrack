import { credentialInterface } from "@/lib/database/credential";
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
    await credentialInterface.deleteByLabel(orgId, decodedLabel);
  } catch {
    return NextResponse.json({ error: "Credential not found" }, { status: 404 });
  }

  // Invalidate caches that referenced this credential
  revalidateTag(`credential:${orgId}:${decodedLabel}`, "max");

  return new NextResponse(null, { status: 204 });
};
