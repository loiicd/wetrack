"use server";

import { withAuth } from "@/lib/auth/withAuth";
import { membership } from "@/lib/clerk/membership";
import { withErrorHandling } from "@/lib/withErrorHandling";

const ALLOWED_ROLE = "org:admin";

export const deleteMembership = async (userId: string) => {
  return withErrorHandling(() =>
    withAuth(ALLOWED_ROLE, async (_userId, orgId) => {
      await membership.delete(orgId, userId);
    }),
  );
};
