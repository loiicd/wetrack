import client from "./clerkClient";

export const membership = {
  async get(userId: string) {
    const memberships = await client.users.getOrganizationMembershipList({
      userId,
      limit: 10,
    });

    return memberships.data;
  },
};
