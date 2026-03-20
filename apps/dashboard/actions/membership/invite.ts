"use server";

import { withAuth } from "@/lib/auth/withAuth";
import { membership } from "@/lib/clerk/membership";
import { withErrorHandling } from "@/lib/withErrorHandling";

const ALLOWED_ROLE = "org:admin";

export const inviteMembership = async (
  email: string,
  role: "org:admin" | "org:member",
) => {
  return withErrorHandling(() =>
    withAuth(ALLOWED_ROLE, async (userId, orgId) => {
      await membership.invite(orgId, email, role, userId);
    }),
  );
};
