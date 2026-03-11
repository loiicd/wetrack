import { stackSchema } from "@/schemas/dashboard";
import { NextRequest, NextResponse } from "next/server";
import { mainWorkflow } from "@/lib/workflows/main";

export const POST = async (request: NextRequest) => {
  const data = stackSchema.parse(await request.json());

  console.log("Received stack data:", data);

  await mainWorkflow(data);

  return new NextResponse("Ok", { status: 200 });
};
