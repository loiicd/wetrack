import client from "./clerkClient";

const organizationInterface = {
  async get(id: string) {
    const cl = await client();
    return await cl.organizations.getOrganization({
      organizationId: id,
    });
  },
};

export default organizationInterface;
