import { StackCreateInput } from "@/generated/prisma/models";
import prisma from "./prisma";
import { StackId } from "@/types/ids";

export const stackInterface = {
  async create(data: StackCreateInput): Promise<StackId> {
    const stackRecord = await prisma.stack.create({
      data,
    });
    return stackRecord.id as StackId;
  },
};
