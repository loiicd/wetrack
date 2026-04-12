import { DataSourceCreateManyInput } from "@/generated/prisma/models";
import prisma from "./prisma";
import type { DatabaseClient } from "./client";

export const dataSourceInterface = {
  async create(
    data: Pick<
      DataSourceCreateManyInput,
      "key" | "type" | "config" | "stackId"
    >,
    db: DatabaseClient = prisma,
  ) {
    return await db.dataSource.upsert({
      where: {
        stackId_key: { stackId: data.stackId, key: data.key },
      },
      update: {
        type: data.type,
        config: data.config,
      },
      create: {
        version: 1,
        ...data,
      },
    });
  },

  async createMany(
    data: DataSourceCreateManyInput[],
    db: DatabaseClient = prisma,
  ) {
    await Promise.all(
      data.map((d) =>
        db.dataSource
          .upsert({
            where: {
              stackId_key: { stackId: d.stackId, key: d.key },
            },
            update: {
              type: d.type,
              config: d.config,
              version: d.version ?? 1,
            },
            create: {
              stackId: d.stackId,
              key: d.key,
              type: d.type,
              config: d.config,
              version: d.version ?? 1,
            },
          })
          .catch((error) => {
            throw new Error(
              `Failed to upsert dataSource '${d.key}': ${error instanceof Error ? error.message : String(error)}`,
            );
          }),
      ),
    );
  },

  async getById(id: string) {
    return await prisma.dataSource.findUnique({
      where: { id },
      include: { stack: { select: { orgId: true } } },
    });
  },

  async getByLatestStackKey(stackKey: string) {
    return await prisma.dataSource.findFirst({
      where: {
        stack: {
          key: stackKey,
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getByStackId(stackId: string, db: DatabaseClient = prisma) {
    return await db.dataSource.findMany({
      where: { stackId },
    });
  },

  async getMany(orgId?: string) {
    return await prisma.dataSource.findMany({
      where: orgId ? { stack: { orgId } } : undefined,
      include: { stack: { select: { environment: true, key: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  async deleteNotInKeys(
    stackId: string,
    keys: string[],
    db: DatabaseClient = prisma,
  ) {
    await db.dataSource.deleteMany({
      where: {
        stackId,
        key: { notIn: keys },
      },
    });
  },
};
