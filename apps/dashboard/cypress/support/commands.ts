// cypress/support/commands.ts
import { addClerkCommands } from "@clerk/testing/cypress";

addClerkCommands({ Cypress, cy });

export {};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      signIn(email?: string): Chainable<void>;
    }
  }
}

// cy.signIn() authenticates via Clerk Backend API (bypasses FAPI bot detection).
// Steps:
//  1. Visit /signIn so Clerk sets the __clerk_db_jwt dev-browser cookie (required by middleware)
//  2. Fetch a fresh session JWT from the Clerk Backend API via cy.task()
//  3. Set __session + __client_uat cookies (both suffixed AND unsuffixed):
//     - Unsuffixed: read by the Next.js middleware (server-side auth)
//     - Suffixed:   read by Clerk JS (client-side hooks: useUser, useOrganization, etc.)
Cypress.Commands.add("signIn", (email?: string) => {
  const userEmail = email ?? Cypress.env("TEST_USER_EMAIL");

  // Step 1: visit any page so Clerk JS sets __clerk_db_jwt (required by middleware in dev mode)
  cy.visit("/signIn");

  // Step 2+3: get fresh JWT and set all auth cookies
  cy.task<{ jwt: string; iat: number; cookieSuffix: string }>(
    "getClerkSessionJWT",
    userEmail,
  ).then(({ jwt, iat, cookieSuffix }) => {
    const cookieOpts = { domain: "localhost", path: "/", httpOnly: false, secure: false };
    const iatStr = String(iat);

    // Unsuffixed: used by Next.js middleware
    cy.setCookie("__session", jwt, cookieOpts);
    cy.setCookie("__client_uat", iatStr, cookieOpts);

    // Suffixed: used by Clerk JS client-side hooks (useUser, useOrganization, etc.)
    cy.setCookie(`__session_${cookieSuffix}`, jwt, cookieOpts);
    cy.setCookie(`__client_uat_${cookieSuffix}`, iatStr, cookieOpts);
  });
});
