"use server";

import { membership } from "@/lib/clerk/membership";
import { withAuth } from "@/lib/auth/withAuth";
import { withErrorHandling } from "@/lib/withErrorHandling";

export const updateRole = async (userId: string, newRole: string) => {
  return withErrorHandling(() =>
    withAuth("org:admin", async (_userId, orgId) => {
      if (newRole !== "org:admin") {
        const members = await membership.getByOrganization(orgId);
        const admins = members.filter((m) => m.role === "org:admin");
        const isLastAdmin =
          admins.length === 1 && admins[0]?.publicUserData?.userId === userId;
        if (isLastAdmin) {
          throw new Error(
            "The last admin cannot be downgraded. Assign another admin first.",
          );
        }
      }
      await membership.updateRole(orgId, userId, newRole);
    }),
  );
};
