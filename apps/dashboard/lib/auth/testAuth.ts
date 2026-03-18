import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

export const testAuth = async () => {
  const { userId, isAuthenticated, orgId } = await auth();

  if (!isAuthenticated || !userId || !orgId) {
    return notFound();
  }

  return { userId, orgId };
};
