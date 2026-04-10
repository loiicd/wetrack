import { auth } from "@clerk/nextjs/server";

export const getAuth = async () => {
  const { userId, isAuthenticated, orgId } = await auth();

  if (!isAuthenticated || !userId || !orgId) {
    // return redirect("/");
    throw new Error("Unauthorized");
  }

  return { userId, orgId };
};
