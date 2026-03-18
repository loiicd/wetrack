import client from "./clerkClient";

const organizationInterface = {
  async get(id: string) {
    return await client.organizations.getOrganization({
      organizationId: id,
    });
  },
};

export default organizationInterface;
