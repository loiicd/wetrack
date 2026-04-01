import { auth } from "@clerk/nextjs/server";

export const authorization = async (role: "org:admin" | "org:member") => {
  const { has } = await auth();
  return has({ role });
};
