import { credentialInterface } from "@/lib/database/credential";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ label: string }> };

export const DELETE = async (_req: NextRequest, { params }: Params) => {
  const { orgId } = await auth();
  if (!orgId) return new NextResponse("Organization required", { status: 403 });

  const { label } = await params;

  try {
    await credentialInterface.deleteByLabel(orgId, decodeURIComponent(label));
  } catch {
    return NextResponse.json({ error: "Credential not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
};
