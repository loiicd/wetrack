import { DataSourceCreateManyInput } from "@/generated/prisma/models";
import prisma from "./prisma";

export const dataSourceInterface = {
  async create(data: {
    key: string;
    name: string;
    type: string;
    config: any;
    stackId: string;
  }) {
    return await prisma.dataSource.create({ data });
  },

  async createMany(data: DataSourceCreateManyInput[]) {
    await prisma.dataSource.createMany({ data });
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
};
