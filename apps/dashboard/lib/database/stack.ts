import { StackCreateInput } from "@/generated/prisma/models";
import prisma from "./prisma";

export const stackInterface = {
  async create(data: StackCreateInput) {
    return await prisma.stack.create({
      data,
    });
  },
};
