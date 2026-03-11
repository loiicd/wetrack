import { TransformCreateManyInput } from "@/generated/prisma/models";
import prisma from "./prisma";

export const transformInterface = {
  async create(data: TransformCreateManyInput) {
    return await prisma.transform.create({ data });
  },

  async createMany(data: TransformCreateManyInput[]) {
    await prisma.transform.createMany({ data });
  },

  async getByStackId(stackId: string) {
    return await prisma.transform.findMany({
      where: { stackId },
    });
  },
};
