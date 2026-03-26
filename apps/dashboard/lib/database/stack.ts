import { StackCreateInput } from "@/generated/prisma/models";
import prisma from "./prisma";
import { StackId } from "@/types/ids";

export const stackInterface = {
  async create(data: StackCreateInput & { orgId: string }): Promise<StackId> {
    const stackRecord = await prisma.stack.upsert({
      where: {
        key_environment_orgId: {
          key: data.key,
          environment: data.environment,
          orgId: data.orgId,
        },
      },
      update: {},
      create: data,
    });
    return stackRecord.id as StackId;
  },

  async getMany(orgId?: string) {
    return await prisma.stack.findMany({
      where: orgId ? { orgId } : undefined,
    });
  },
};
