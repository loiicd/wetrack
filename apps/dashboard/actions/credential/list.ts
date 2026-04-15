"use server";

import { getInfisicalClient, getProjectId, getEnvironment, getSecretPath, isInfisicalConfigured } from "@/lib/vault/infisical";
import { withAuth } from "@/lib/auth/withAuth";
import { withErrorHandling } from "@/lib/withErrorHandling";

export type CredentialListItem = {
  secretKey: string;
  type: string;
  headerName: string | null;
  createdAt: string;
  updatedAt: string;
};

export const listCredentials = async () => {
  return withErrorHandling(() =>
    withAuth("org:member", async (_userId, orgId) => {
      if (!isInfisicalConfigured()) {
        return [];
      }

      const client = await getInfisicalClient();
      const response = await client.secrets().listSecrets({
        projectId: getProjectId(),
        environment: getEnvironment(),
        secretPath: getSecretPath(orgId),
      });

      return response.secrets.map((secret) => {
        let meta: { type?: string; headerName?: string } = {};
        try {
          if (secret.secretComment) {
            meta = JSON.parse(secret.secretComment);
          }
        } catch {
          // ignore parse errors
        }

        return {
          secretKey: secret.secretKey,
          type: meta.type ?? "api-key",
          headerName: meta.headerName ?? null,
          createdAt: secret.createdAt,
          updatedAt: secret.updatedAt,
        } satisfies CredentialListItem;
      });
    }),
  );
};
