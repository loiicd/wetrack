import prisma from "./prisma";

export const dashboardInterface = {
  async create(data: {
    key: string;
    label: string;
    description: string;
    stackId: string;
  }) {
    return await prisma.dashboard.upsert({
      where: {
        stackId_key: { stackId: data.stackId, key: data.key },
      },
      update: {
        label: data.label,
        description: data.description,
      },
      create: {
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
    await Promise.all(
      data.map((d) =>
        prisma.dashboard.upsert({
          where: {
            stackId_key: { stackId: d.stackId, key: d.key },
          },
          update: {
            label: d.label,
            description: d.description ?? null,
          },
          create: {
            version: 1,
            ...d,
            description: d.description ?? null,
          },
        }),
      ),
    );
  },

  async getById(id: string) {
    return await prisma.dashboard.findUnique({
      where: { id },
      include: { stack: { select: { environment: true, key: true } } },
    });
  },

  async getByStackId(stackId: string) {
    return await prisma.dashboard.findMany({
      where: { stackId },
    });
  },

  async getMany(orgId?: string) {
    return await prisma.dashboard.findMany({
      where: orgId
        ? { stack: { orgId } }
        : undefined,
      include: {
        stack: {
          select: { environment: true, key: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
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

  async deleteNotInKeys(stackId: string, keys: string[]) {
    await prisma.dashboard.deleteMany({
      where: {
        stackId,
        key: { notIn: keys },
      },
    });
  },
};
