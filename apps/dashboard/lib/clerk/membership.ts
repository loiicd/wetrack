import client from "./clerkClient";

export const membership = {
  async get(userId: string) {
    const cl = await client();
    const memberships = await cl.users.getOrganizationMembershipList({
      userId,
      limit: 10,
    });

    return memberships.data;
  },

  async getByOrganization(organizationId: string) {
    const cl = await client();
    const memberships = await cl.organizations.getOrganizationMembershipList({
      organizationId,
      limit: 10,
    });

    return memberships.data;
  },

  async updateRole(organizationId: string, userId: string, newRole: string) {
    const cl = await client();
    await cl.organizations.updateOrganizationMembership({
      organizationId,
      userId,
      role: newRole,
    });
  },

  async delete(organizationId: string, userId: string) {
    const cl = await client();
    await cl.organizations.deleteOrganizationMembership({
      organizationId,
      userId,
    });
  },

  async invite(
    organizationId: string,
    emailAddress: string,
    role: string,
    inviterUserId: string,
  ) {
    const cl = await client();
    await cl.organizations.createOrganizationInvitation({
      organizationId,
      emailAddress,
      role,
      inviterUserId,
    });
  },
};
