"use server";

import { getInfisicalClient, getProjectId, getEnvironment, getSecretPath, isInfisicalConfigured, ensureOrgFolder } from "@/lib/vault/infisical";
import { withAuth } from "@/lib/auth/withAuth";
import { withErrorHandling } from "@/lib/withErrorHandling";
import { revalidateTag } from "next/cache";
import { z } from "zod";

const createCredentialSchema = z.object({
  label: z.string().min(1).max(100),
  type: z.enum(["api-key", "bearer", "basic", "header"]),
  value: z.string().min(1),
  headerName: z.string().optional(),
});

export const createCredential = async (formData: FormData) => {
  return withErrorHandling(() =>
    withAuth("org:admin", async (_userId, orgId) => {
      if (!isInfisicalConfigured()) {
        throw new Error(
          "Infisical is not configured. Set INFISICAL_CLIENT_ID, INFISICAL_CLIENT_SECRET, and INFISICAL_PROJECT_ID environment variables.",
        );
      }

      const raw = {
        label: formData.get("label"),
        type: formData.get("type"),
        value: formData.get("value"),
        headerName: formData.get("headerName") || undefined,
      };

      const parsed = createCredentialSchema.parse(raw);

      const meta: Record<string, string> = { type: parsed.type };
      if (parsed.headerName) {
        meta.headerName = parsed.headerName;
      }

      const client = await getInfisicalClient();
      await ensureOrgFolder(orgId);
      await client.secrets().createSecret(parsed.label, {
        secretValue: parsed.value,
        secretComment: JSON.stringify(meta),
        projectId: getProjectId(),
        environment: getEnvironment(),
        secretPath: getSecretPath(orgId),
      });

      revalidateTag(`credential:${orgId}:${parsed.label}`, "max");

      return {
        label: parsed.label,
        type: parsed.type,
      };
    }),
  );
};
