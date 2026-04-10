import { auth } from "@clerk/nextjs/server";

export const getPageAuth = async () => {
  const { userId, isAuthenticated, orgId, redirectToSignIn } = await auth();

  if (!isAuthenticated || !userId || !orgId) {
    throw redirectToSignIn();
  }

  return { userId, orgId };
};
