import { DataSourceCreateManyInput } from "@/generated/prisma/models";
import prisma from "./prisma";

export const dataSourceInterface = {
  async create(
    data: Pick<DataSourceCreateManyInput, "key" | "type" | "config" | "stackId">,
  ) {
    return await prisma.dataSource.create({
      data: {
        version: 1,
        ...data,
      },
    });
  },

  async createMany(data: DataSourceCreateManyInput[]) {
    await prisma.dataSource.createMany({ data });
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
};
