import { Permission } from "@/types/permission";
import { auth } from "@clerk/nextjs/server";
import { authorization } from "./authorization";

export const withAuth = async <T>(
  role: "org:admin" | "org:member",
  action: (userId: string, orgId: string) => Promise<T>,
): Promise<T> => {
  const { userId, isAuthenticated, orgId } = await auth();

  if (!isAuthenticated || !userId) {
    throw new Error("Unauthorized");
  }

  if (!orgId) {
    throw new Error("Organization ID is required");
  }

  const isAuthorized = await authorization(role);
  if (!isAuthorized) {
    throw new Error("Forbidden");
  }

  return await action(userId, orgId);
};
