"use server";

import { credentialInterface } from "@/lib/database/credential";
import { withAuth } from "@/lib/auth/withAuth";
import { withErrorHandling } from "@/lib/withErrorHandling";
import { revalidateTag } from "next/cache";

export const deleteCredential = async (label: string) => {
  return withErrorHandling(() =>
    withAuth("org:admin", async (_userId, orgId) => {
      await credentialInterface.deleteByLabel(orgId, label);

      revalidateTag(`credential:${orgId}:${label}`, "max");
    }),
  );
};
