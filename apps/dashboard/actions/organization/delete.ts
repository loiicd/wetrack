"use server";

import { withAuth } from "@/lib/auth/withAuth";
import { withErrorHandling } from "@/lib/withErrorHandling";
import clerkClient from "@/lib/clerk/clerkClient";

export const deleteOrganization = async () => {
  return withErrorHandling(() =>
    withAuth("org:admin", async (_userId, orgId) => {
      const client = await clerkClient();
      await client.organizations.deleteOrganization(orgId);
    }),
  );
};
