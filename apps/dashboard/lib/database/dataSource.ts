import prisma from "./prisma";

export const dataSourceInterface = {
  async create(data: {
    name: string;
    type: string;
    config: any;
    stackId: string;
  }) {
    return await prisma.dataSource.create({ data });
  },
};
