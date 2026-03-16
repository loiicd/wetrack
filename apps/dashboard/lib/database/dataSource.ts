import { DataSourceCreateManyInput } from "@/generated/prisma/models";
import prisma from "./prisma";

export const dataSourceInterface = {
  async create(
    data: Pick<
      DataSourceCreateManyInput,
      "key" | "type" | "config" | "stackId"
    >,
  ) {
    return await prisma.dataSource.upsert({
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

  async createMany(data: DataSourceCreateManyInput[]) {
    await Promise.all(
      data.map((d) =>
        prisma.dataSource.upsert({
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
        }),
      ),
    );
  },

  async getById(id: string) {
    return await prisma.dataSource.findUnique({ where: { id } });
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

  async getByStackId(stackId: string) {
    return await prisma.dataSource.findMany({
      where: { stackId },
    });
  },

  async getMany() {
    return await prisma.dataSource.findMany();
  },

  async deleteNotInKeys(stackId: string, keys: string[]) {
    await prisma.dataSource.deleteMany({
      where: {
        stackId,
        key: { notIn: keys },
      },
    });
  },
};
