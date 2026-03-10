import prisma from "./prisma";

export const dashboardInterface = {
  async create(data: { key: string; title: string; stackId: string }) {
    return await prisma.dashboard.create({ data });
  },

  async getById(id: string) {
    return await prisma.dashboard.findUnique({ where: { id } });
  },

  async getLatestByStackKey(stackKey: string) {
    const allDashboards = await prisma.dashboard.findMany({
      where: {
        stack: {
          key: stackKey,
        },
      },
      orderBy: {
        createdAt: "desc",
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
