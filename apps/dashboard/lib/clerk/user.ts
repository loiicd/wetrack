import client from "./clerkClient";

export const userInterface = {
  async get(userId: string) {
    const cl = await client();
    return await cl.users.getUser(userId);
  },
};
