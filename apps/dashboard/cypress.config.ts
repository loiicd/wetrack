import { defineConfig } from "cypress";
import * as dotenv from "dotenv";
import * as path from "path";
import * as crypto from "crypto";
import { clerkSetup } from "@clerk/testing/cypress";

dotenv.config({ path: path.resolve(__dirname, ".env") });

function getCookieSuffix(publishableKey: string): string {
  const hash = crypto.createHash("sha1").update(publishableKey).digest();
  return Buffer.from(hash)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .substring(0, 8);
}

async function createClerkSessionJWT(
  email: string,
): Promise<{ jwt: string; iat: number; cookieSuffix: string }> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!secretKey) throw new Error("CLERK_SECRET_KEY is not set");
  if (!publishableKey) throw new Error("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set");

  const headers = {
    Authorization: `Bearer ${secretKey}`,
    "Content-Type": "application/json",
  };

  const usersRes = await fetch(
    `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`,
    { headers },
  );
  const usersData = (await usersRes.json()) as { data?: { id: string }[] } | { id: string }[];
  const users = Array.isArray(usersData) ? usersData : (usersData.data ?? []);
  if (!users.length) throw new Error(`Clerk user not found for email: ${email}`);
  const userId = users[0].id;

  const sessionRes = await fetch("https://api.clerk.com/v1/sessions", {
    method: "POST",
    headers,
    body: JSON.stringify({ user_id: userId }),
  });
  const session = (await sessionRes.json()) as { id?: string };
  if (!session.id) throw new Error(`Failed to create Clerk session: ${JSON.stringify(session)}`);

  const tokenRes = await fetch(`https://api.clerk.com/v1/sessions/${session.id}/tokens`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });
  const tokenData = (await tokenRes.json()) as { jwt?: string };
  if (!tokenData.jwt) throw new Error(`Failed to get session token: ${JSON.stringify(tokenData)}`);

  const payload = JSON.parse(
    Buffer.from(tokenData.jwt.split(".")[1], "base64").toString(),
  );

  return {
    jwt: tokenData.jwt,
    iat: payload.iat,
    cookieSuffix: getCookieSuffix(publishableKey),
  };
}

export default defineConfig({
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
    specPattern: "cypress/component/**/*.cy.{ts,tsx}",
    supportFile: "cypress/support/component.ts",
    indexHtmlFile: "cypress/support/component-index.html",
  },
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    async setupNodeEvents(on, config) {
      on("task", {
        async getClerkSessionJWT(email: string) {
          return createClerkSessionJWT(email);
        },
      });

      return clerkSetup({ config }).catch((err) => {
        console.warn("[Cypress] clerkSetup failed:", err.message);
        config.env.CLERK_FAPI = "suitable-goat-51.clerk.accounts.dev";
        return config;
      });
    },
  },
  env: {
    TEST_USER_EMAIL: process.env.TEST_USER_EMAIL ?? "test@example.com",
    TEST_USER_PASSWORD: process.env.TEST_USER_PASSWORD ?? "TestPass123!",
    TEST_ORG_NAME: process.env.TEST_ORG_NAME ?? "Test Organization",
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  },
});
