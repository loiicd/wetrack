import { cacheLife } from "next/cache";
import prisma from "./prisma";

export const dashboardInterface = {
  async create(data: {
    key: string;
    label: string;
    description: string;
    stackId: string;
  }) {
    return await prisma.dashboard.create({
      data: {
        version: 1,
        ...data,
      },
    });
  },

  async createMany(
    data: {
      key: string;
      label: string;
      description?: string | null;
      stackId: string;
    }[],
  ) {
    const dataWithVersion = data.map((d) => ({
      version: 1,
      ...d,
      description: d.description ?? null,
    }));
    await prisma.dashboard.createMany({ data: dataWithVersion });
  },

  async getById(id: string) {
    return await prisma.dashboard.findUnique({ where: { id } });
  },

  async getMany() {
    return await prisma.dashboard.findMany();
  },

  async getByStackKey(stackKey: string) {
    const allDashboards = await prisma.dashboard.findMany({
      where: {
        stack: {
          key: stackKey,
        },
      },
    });

    const latestByKey = new Map<string, (typeof allDashboards)[0]>();
    for (const dashboard of allDashboards) {
      if (!latestByKey.has(dashboard.key)) {
        latestByKey.set(dashboard.key, dashboard);
      }
    }

    return Array.from(latestByKey.values());
  },
};
