import { QueryCreateManyInput } from "@/generated/prisma/models";
import prisma from "./prisma";

export const queryInterface = {
  async create(data: QueryCreateManyInput) {
    return await prisma.query.create({ data });
  },

  async createMany(data: QueryCreateManyInput[]) {
    await prisma.query.createMany({ data });
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
