import { auth } from "@clerk/nextjs/server";
// import { redirect } from "next/navigation";

export const testAuth = async () => {
  // await connection();
  const { userId, isAuthenticated, orgId } = await auth();

  if (!isAuthenticated || !userId || !orgId) {
    // return redirect("/");
    throw new Error("Unauthorized");
  }

  return { userId, orgId };
};
