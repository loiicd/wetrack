import { Prisma } from "@/generated/prisma/client";
import prisma from "./prisma";
import type { DatabaseClient } from "./client";

type FilterUpsertInput = {
  stackId: string;
  key: string;
  type: string;
  config?: Prisma.InputJsonValue;
  label?: string | null;
  version?: number;
};

export const filterInterface = {
  async create(data: FilterUpsertInput, db: DatabaseClient = prisma) {
    return await db.filter.upsert({
      where: {
        stackId_key: { stackId: data.stackId, key: data.key },
      },
      update: {
        type: data.type,
        config: data.config ?? Prisma.JsonNull,
        label: data.label ?? null,
        version: data.version ?? 1,
      },
      create: {
        stackId: data.stackId,
        key: data.key,
        type: data.type,
        config: data.config ?? Prisma.JsonNull,
        label: data.label ?? null,
        version: data.version ?? 1,
      },
    });
  },

  async createMany(data: FilterUpsertInput[], db: DatabaseClient = prisma) {
    for (const d of data) {
      try {
        await db.filter.upsert({
          where: { stackId_key: { stackId: d.stackId, key: d.key } },
          update: {
            type: d.type,
            config: d.config ?? Prisma.JsonNull,
            label: d.label ?? null,
            version: d.version ?? 1,
          },
          create: {
            stackId: d.stackId,
            key: d.key,
            type: d.type,
            config: d.config ?? Prisma.JsonNull,
            label: d.label ?? null,
            version: d.version ?? 1,
          },
        });
      } catch (error) {
        throw new Error(
          `Failed to upsert filter '${d.key}': ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  },

  async getByStackId(stackId: string, db: DatabaseClient = prisma) {
    return await db.filter.findMany({ where: { stackId } });
  },

  async getMany(orgId?: string) {
    return await prisma.filter.findMany({
      where: orgId ? { stack: { orgId } } : undefined,
    });
  },

  async deleteNotInKeys(stackId: string, keys: string[], db: DatabaseClient = prisma) {
    await db.filter.deleteMany({
      where: {
        stackId,
        key: { notIn: keys },
      },
    });
  },
};
