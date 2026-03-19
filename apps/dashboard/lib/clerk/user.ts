import client from "./clerkClient";

export const userInterface = {
  async get(userId: string) {
    return await client.users.getUser(userId);
  },
};
