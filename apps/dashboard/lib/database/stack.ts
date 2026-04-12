import { StackCreateInput } from "@/generated/prisma/models";
import prisma from "./prisma";
import { StackId } from "@/types/ids";
import type { DatabaseClient } from "./client";

export const stackInterface = {
  async create(
    data: StackCreateInput & { orgId: string },
    db: DatabaseClient = prisma,
  ): Promise<StackId> {
    const stackRecord = await db.stack.upsert({
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
