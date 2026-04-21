import { StackCreateInput } from "@/generated/prisma/models";
import { Prisma } from "@/generated/prisma/client";
import prisma from "./prisma";
import { StackId } from "@/types/ids";
import type { DatabaseClient } from "./client";

type StackCreateInputWithRawJson = StackCreateInput & {
  orgId: string;
  rawJson?: Prisma.InputJsonValue;
};

export const stackInterface = {
  async create(
    data: StackCreateInputWithRawJson,
    db: DatabaseClient = prisma,
  ): Promise<StackId> {
    const { rawJson, ...rest } = data;
    const stackRecord = await (db.stack as any).upsert({
      where: {
        key_environment_orgId: {
          key: data.key,
          environment: data.environment,
          orgId: data.orgId,
        },
      },
      update: rawJson !== undefined ? { rawJson } : {},
      create: rawJson !== undefined ? { ...rest, rawJson } : rest,
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
