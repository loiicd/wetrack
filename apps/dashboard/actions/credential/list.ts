"use server";

import { credentialInterface } from "@/lib/database/credential";
import { withAuth } from "@/lib/auth/withAuth";
import { withErrorHandling } from "@/lib/withErrorHandling";

export const listCredentials = async () => {
  return withErrorHandling(() =>
    withAuth("org:member", async (_userId, orgId) => {
      return credentialInterface.getByOrgId(orgId);
    }),
  );
};
