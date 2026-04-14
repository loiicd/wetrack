"use server";

import { credentialInterface } from "@/lib/database/credential";
import { encryptSecret, isVaultConfigured } from "@/lib/vault/encryption";
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
      if (!isVaultConfigured()) {
        throw new Error(
          "VAULT_SECRET is not configured. Set the VAULT_SECRET environment variable to enable credential encryption.",
        );
      }

      const raw = {
        label: formData.get("label"),
        type: formData.get("type"),
        value: formData.get("value"),
        headerName: formData.get("headerName") || undefined,
      };

      const parsed = createCredentialSchema.parse(raw);

      const encryptedValue = await encryptSecret(parsed.value);

      const credential = await credentialInterface.create({
        orgId,
        label: parsed.label,
        type: parsed.type,
        encryptedValue,
        headerName: parsed.headerName,
      });

      revalidateTag(`credential:${orgId}:${parsed.label}`, "max");

      return {
        id: credential.id,
        label: credential.label,
        type: credential.type,
      };
    }),
  );
};
