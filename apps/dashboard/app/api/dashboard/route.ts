import { stackInterface } from "@/lib/database/stack";
import { dashboardInterface } from "@/lib/database/dashboard";
import { stackSchema } from "@/schemas/dashboard";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { dataSourceInterface } from "@/lib/database/dataSource";

export const POST = async (request: NextRequest) => {
  const data = stackSchema.parse(await request.json());

  console.log("Received stack data:", data);

  await main(data);

  return new NextResponse("Ok", { status: 200 });
};

const main = async (data: z.infer<typeof stackSchema>) => {
  const stack = await stackInterface.create({
    name: data.name,
    environment: data.environment,
  });

  await Promise.all(
    data.dashboards.map(async (dashboard) => {
      dashboardInterface.create({
        stackId: stack.id,
        ...dashboard,
      });
    }),
  );

  await Promise.all(
    data.dataSources.map(async (dataSource) => {
      dataSourceInterface.create({
        stackId: stack.id,
        ...dataSource,
      });
    }),
  );
};
