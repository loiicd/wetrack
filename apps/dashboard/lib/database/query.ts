import { QueryType } from "@/generated/prisma/enums";
import prisma from "./prisma";
import type { DatabaseClient } from "./client";

type QueryUpsertInput = {
  stackId: string;
  key: string;
  type: QueryType;
  dataSourceId?: string | null;
  sourceQueryId?: string | null;
  jsonPath?: string | null;
  sql?: string | null;
  version?: number;
};

export const queryInterface = {
  async updateSourceQueryId(
    id: string,
    sourceQueryId: string,
    db: DatabaseClient = prisma,
  ) {
    return await db.query.update({
      where: { id },
      data: { sourceQueryId },
    });
  },

  async create(data: QueryUpsertInput, db: DatabaseClient = prisma) {
    return await db.query.upsert({
      where: {
        stackId_key: { stackId: data.stackId, key: data.key },
      },
      update: {
        type: data.type,
        dataSourceId: data.dataSourceId,
        sourceQueryId: data.sourceQueryId,
        jsonPath: data.jsonPath,
        sql: data.sql,
        version: data.version ?? 1,
      },
      create: {
        stackId: data.stackId,
        key: data.key,
        type: data.type,
        dataSourceId: data.dataSourceId,
        sourceQueryId: data.sourceQueryId,
        jsonPath: data.jsonPath,
        sql: data.sql,
        version: data.version ?? 1,
      },
    });
  },

  async createMany(data: QueryUpsertInput[], db: DatabaseClient = prisma) {
    // Sequentiell um Reihenfolge (sourceQuery-Abhängigkeiten) zu respektieren
    for (const d of data) {
      try {
        await db.query.upsert({
          where: {
            stackId_key: { stackId: d.stackId, key: d.key },
          },
          update: {
            type: d.type,
            dataSourceId: d.dataSourceId,
            sourceQueryId: d.sourceQueryId,
            jsonPath: d.jsonPath,
            sql: d.sql,
            version: d.version ?? 1,
          },
          create: {
            stackId: d.stackId,
            key: d.key,
            type: d.type,
            dataSourceId: d.dataSourceId,
            sourceQueryId: d.sourceQueryId,
            jsonPath: d.jsonPath,
            sql: d.sql,
            version: d.version ?? 1,
          },
        });
      } catch (error) {
        throw new Error(
          `Failed to upsert query '${d.key}': ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  },

  async getById(id: string) {
    return await prisma.query.findUnique({ where: { id } });
  },

  async getByStackId(stackId: string, db: DatabaseClient = prisma) {
    return await db.query.findMany({
      where: { stackId },
    });
  },

  async getMany(orgId?: string) {
    return await prisma.query.findMany({
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
    await db.query.deleteMany({
      where: {
        stackId,
        key: { notIn: keys },
      },
    });
  },
};
