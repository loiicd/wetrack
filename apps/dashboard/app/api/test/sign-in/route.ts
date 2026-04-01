// Development-only endpoint for Cypress E2E authentication
// Creates a Clerk sign-in token (magic link) for the given email
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return Response.json(
      { error: "Not available in production" },
      { status: 403 },
    );
  }

  const { email } = (await request.json()) as { email: string };
  if (!email) {
    return Response.json({ error: "email required" }, { status: 400 });
  }

  const clerk = await clerkClient();
  const users = await clerk.users.getUserList({ emailAddress: [email] });
  const user = users.data[0];

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const signInToken = await clerk.signInTokens.createSignInToken({
    userId: user.id,
    expiresInSeconds: 60,
  });

  return Response.json({ url: signInToken.url });
}
