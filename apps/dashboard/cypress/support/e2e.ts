// cypress/support/e2e.ts
import "./commands";

// Ignore recoverable Next.js/Clerk SSR errors.
// When Clerk hooks run during SSR without a fully initialized context (e.g.
// because the test session uses a backend-API JWT not visible to FAPI),
// React 19 / Next.js 15 falls back to client-side rendering and logs this error.
// It does NOT break the actual test scenario.
Cypress.on("uncaught:exception", (err) => {
  if (
    err.message.includes("ClerkProvider") ||
    err.message.includes("useOrganizationList") ||
    err.message.includes("useClerk") ||
    err.message.includes("Switched to client rendering")
  ) {
    return false;
  }
  return true;
});
