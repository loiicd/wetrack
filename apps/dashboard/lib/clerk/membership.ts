import client from "./clerkClient";

export const membership = {
  async get(userId: string) {
    const memberships = await client.users.getOrganizationMembershipList({
      userId,
      limit: 10,
    });

    return memberships.data;
  },

  async getByOrganization(organizationId: string) {
    const memberships =
      await client.organizations.getOrganizationMembershipList({
        organizationId,
        limit: 10,
      });

    return memberships.data;
  },

  async updateRole(organizationId: string, userId: string, newRole: string) {
    await client.organizations.updateOrganizationMembership({
      organizationId,
      userId,
      role: newRole,
    });
  },

  async delete(organizationId: string, userId: string) {
    await client.organizations.deleteOrganizationMembership({
      organizationId,
      userId,
    });
  },
};
