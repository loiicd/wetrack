import { auth } from "@clerk/nextjs/server";

export const authorization = async (role: "org:admin" | "org:member") => {
  const { has, sessionClaims, orgId, userId } = await auth();

  const result = has({ role });
  const userPermissions =
    (sessionClaims?.org_permissions as string[] | undefined) ?? [];
  console.log(
    `[authorization] required="${role}" userId=${userId} orgId=${orgId} userPermissions=${JSON.stringify(userPermissions)} result=${result}`,
  );

  return result;
};
