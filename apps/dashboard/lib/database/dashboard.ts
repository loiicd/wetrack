import prisma from "./prisma";
import type { DatabaseClient } from "./client";

export const dashboardInterface = {
  async create(data: {
    key: string;
    label: string;
    description: string;
    stackId: string;
  }, db: DatabaseClient = prisma) {
    return await db.dashboard.upsert({
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
    db: DatabaseClient = prisma,
  ) {
    await Promise.all(
      data.map((d) =>
        db.dashboard.upsert({
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
      include: { stack: { select: { environment: true, key: true, orgId: true } } },
    });
  },

  async getByStackId(stackId: string, db: DatabaseClient = prisma) {
    return await db.dashboard.findMany({
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

  /** Returns all environment variants of a dashboard (same key, same org) */
  async getEnvironmentsByKey(dashboardKey: string, orgId: string) {
    return await prisma.dashboard.findMany({
      where: {
        key: dashboardKey,
        stack: { orgId },
      },
      select: { id: true, stack: { select: { environment: true } } },
      orderBy: { createdAt: "asc" },
    });
  },

  async deleteNotInKeys(
    stackId: string,
    keys: string[],
    db: DatabaseClient = prisma,
  ) {
    await db.dashboard.deleteMany({
      where: {
        stackId,
        key: { notIn: keys },
      },
    });
  },
};
