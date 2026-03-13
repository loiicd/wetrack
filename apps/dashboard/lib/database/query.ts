import { QueryCreateManyInput } from "@/generated/prisma/models";
import prisma from "./prisma";

export const queryInterface = {
  async create(data: QueryCreateManyInput) {
    return await prisma.query.upsert({
      where: {
        stackId_key: { stackId: data.stackId, key: data.key },
      },
      update: {
        dataSourceId: data.dataSourceId,
        jsonPath: data.jsonPath,
        version: data.version ?? 1,
      },
      create: {
        stackId: data.stackId,
        key: data.key,
        dataSourceId: data.dataSourceId,
        jsonPath: data.jsonPath,
        version: data.version ?? 1,
      },
    });
  },

  async createMany(data: QueryCreateManyInput[]) {
    await Promise.all(
      data.map((d) =>
        prisma.query.upsert({
          where: {
            stackId_key: { stackId: d.stackId, key: d.key },
          },
          update: {
            dataSourceId: d.dataSourceId,
            jsonPath: d.jsonPath,
            version: d.version ?? 1,
          },
          create: {
            stackId: d.stackId,
            key: d.key,
            dataSourceId: d.dataSourceId,
            jsonPath: d.jsonPath,
            version: d.version ?? 1,
          },
        }),
      ),
    );
  },

  async getById(id: string) {
    return await prisma.query.findUnique({ where: { id } });
  },

  async getByStackId(stackId: string) {
    return await prisma.query.findMany({
      where: { stackId },
    });
  },

  async getMany() {
    return await prisma.query.findMany();
  },
};
