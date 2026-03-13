import { auth } from "@clerk/nextjs/server";

export const withAuth = async <T>(
  action: (userId: string) => Promise<T>,
): Promise<T> => {
  const { userId, isAuthenticated, orgId } = await auth();

  if (!isAuthenticated || !userId) {
    throw new Error("Unauthorized");
  }

  if (!orgId) {
    throw new Error("Organization ID is required");
  }

  return await action(userId);
};
