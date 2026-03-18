import { clerkClient } from "@clerk/nextjs/server";

const client = await clerkClient();
export default client;
