"use server";

import { getInfisicalClient, getProjectId, getEnvironment, getSecretPath, isInfisicalConfigured, parseCredentialMeta } from "@/lib/vault/infisical";
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
      let secrets: { secretKey: string; secretComment?: string; createdAt: string; updatedAt: string }[] = [];
      try {
        const response = await client.secrets().listSecrets({
          projectId: getProjectId(),
          environment: getEnvironment(),
          secretPath: getSecretPath(orgId),
        });
        secrets = response.secrets;
      } catch {
        // Folder doesn't exist yet (org has no credentials) — return empty list
        secrets = [];
      }

      return secrets.map((secret) => {
        const meta = parseCredentialMeta(secret.secretComment);

        return {
          secretKey: secret.secretKey,
          type: meta.type,
          headerName: meta.headerName ?? null,
          createdAt: secret.createdAt,
          updatedAt: secret.updatedAt,
        } satisfies CredentialListItem;
      });
    }),
  );
};
