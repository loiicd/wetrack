import { StackCreateInput } from "@/generated/prisma/models";
import prisma from "./prisma";
import { StackId } from "@/types/ids";

export const stackInterface = {
  async create(data: StackCreateInput): Promise<StackId> {
    const stackRecord = await prisma.stack.upsert({
      where: {
        key_environment: { key: data.key, environment: data.environment },
      },
      update: {},
      create: data,
    });
    return stackRecord.id as StackId;
  },
};
