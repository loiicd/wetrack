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

  async getByKeyAndEnv(
    key: string,
    environment: string,
    orgId: string,
    db: DatabaseClient = prisma,
  ) {
    return await db.stack.findUnique({
      where: {
        key_environment_orgId: {
          key,
          environment: environment as import("@/generated/prisma/enums").Environment,
          orgId,
        },
      },
    });
  },

  async getMany(orgId?: string) {
    return await prisma.stack.findMany({
      where: orgId ? { orgId } : undefined,
    });
  },
};
