import prisma from "./prisma";

export type CredentialCreateInput = {
  orgId: string;
  label: string;
  type: string;
  encryptedValue: string;
  headerName?: string | null;
};

export const credentialInterface = {
  async create(data: CredentialCreateInput) {
    return await prisma.credential.upsert({
      where: { orgId_label: { orgId: data.orgId, label: data.label } },
      update: {
        type: data.type,
        encryptedValue: data.encryptedValue,
        headerName: data.headerName ?? null,
      },
      create: data,
    });
  },

  async getByOrgId(orgId: string) {
    return await prisma.credential.findMany({
      where: { orgId },
      select: {
        id: true,
        label: true,
        type: true,
        headerName: true,
        createdAt: true,
        updatedAt: true,
        // never return encryptedValue to the client
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getByLabel(orgId: string, label: string) {
    return await prisma.credential.findUnique({
      where: { orgId_label: { orgId, label } },
    });
  },

  async deleteByLabel(orgId: string, label: string) {
    return await prisma.credential.delete({
      where: { orgId_label: { orgId, label } },
    });
  },
};
