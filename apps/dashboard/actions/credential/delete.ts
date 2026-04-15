"use server";

import { getInfisicalClient, getProjectId, getEnvironment, getSecretPath } from "@/lib/vault/infisical";
import { withAuth } from "@/lib/auth/withAuth";
import { withErrorHandling } from "@/lib/withErrorHandling";
import { revalidateTag } from "next/cache";

export const deleteCredential = async (label: string) => {
  return withErrorHandling(() =>
    withAuth("org:admin", async (_userId, orgId) => {
      const client = await getInfisicalClient();
      await client.secrets().deleteSecret(label, {
        projectId: getProjectId(),
        environment: getEnvironment(),
        secretPath: getSecretPath(orgId),
      });

      revalidateTag(`credential:${orgId}:${label}`, "max");
    }),
  );
};
