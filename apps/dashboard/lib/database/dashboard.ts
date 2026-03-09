import prisma from "./prisma";

export const dashboardInterface = {
  async create(data: { name: string; title: string; stackId: string }) {
    return await prisma.dashboard.create({ data });
  },

  async getById(id: string) {
    return await prisma.dashboard.findUnique({ where: { id } });
  },
};
