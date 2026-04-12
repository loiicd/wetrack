import { ChartCreateManyInput } from "@/generated/prisma/models";
import prisma from "./prisma";
import type { DatabaseClient } from "./client";

export const chartInterface = {
  async createMany(
    data: ChartCreateManyInput[],
    db: DatabaseClient = prisma,
  ) {
    await Promise.all(
      data.map((chart) =>
        db.chart.upsert({
          where: {
            stackId_key: { stackId: chart.stackId, key: chart.key },
          },
          update: {
            dashboardId: chart.dashboardId,
            queryId: chart.queryId,
            type: chart.type,
            label: chart.label,
            description: chart.description ?? null,
            config: chart.config,
            layoutX: chart.layoutX ?? 0,
            layoutY: chart.layoutY ?? 0,
            layoutW: chart.layoutW ?? 6,
            layoutH: chart.layoutH ?? 3,
            version: chart.version ?? 1,
          },
          create: {
            stackId: chart.stackId,
            key: chart.key,
            dashboardId: chart.dashboardId,
            queryId: chart.queryId,
            type: chart.type,
            label: chart.label,
            description: chart.description ?? null,
            config: chart.config,
            layoutX: chart.layoutX ?? 0,
            layoutY: chart.layoutY ?? 0,
            layoutW: chart.layoutW ?? 6,
            layoutH: chart.layoutH ?? 3,
            version: chart.version ?? 1,
          },
        }),
      ),
    );
  },

  async getByDashboardId(dashboardId: string) {
    return await prisma.chart.findMany({
      where: { dashboardId },
      include: {
        query: true,
      },
      orderBy: [{ layoutY: "asc" }, { layoutX: "asc" }],
    });
  },

  async deleteNotInKeys(
    stackId: string,
    keys: string[],
    db: DatabaseClient = prisma,
  ) {
    await db.chart.deleteMany({
      where: {
        stackId,
        key: { notIn: keys },
      },
    });
  },
};
