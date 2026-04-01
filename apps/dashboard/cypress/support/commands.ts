// cypress/support/commands.ts
// Custom Cypress commands - per cypress skill: use cy.session for auth caching

export {};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      signIn(email?: string, password?: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add("signIn", (email?: string, password?: string) => {
  const userEmail = email ?? Cypress.env("TEST_USER_EMAIL");
  const userPassword = password ?? Cypress.env("TEST_USER_PASSWORD");

  cy.session(
    ["signIn", userEmail],
    () => {
      cy.visit("/signIn");
      cy.get('[data-testid="sign-in-email"]').type(userEmail);
      cy.get('[data-testid="sign-in-password"]').type(userPassword);
      cy.get('[data-testid="sign-in-submit"]').click();
      cy.url().should("not.include", "/signIn");
    },
    {
      cacheAcrossSpecs: true,
    },
  );
});
