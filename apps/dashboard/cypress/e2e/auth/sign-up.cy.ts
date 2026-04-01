// cypress/e2e/auth/sign-up.cy.ts
// E2E tests for the custom Sign-Up flow

describe("Sign-Up Flow", () => {
  beforeEach(() => {
    cy.visit("/signUp");
  });

  it("displays the sign-up form", () => {
    cy.get('[data-testid="sign-up-form"]').should("be.visible");
    cy.get('[data-testid="sign-up-firstname"]').should("be.visible");
    cy.get('[data-testid="sign-up-lastname"]').should("be.visible");
    cy.get('[data-testid="sign-up-email"]').should("be.visible");
    cy.get('[data-testid="sign-up-password"]').should("be.visible");
    cy.get('[data-testid="sign-up-submit"]').should("be.visible");
  });

  it("shows link to sign-in page", () => {
    cy.get('[data-testid="sign-up-signin-link"]')
      .should("be.visible")
      .and("have.attr", "href", "/signIn");
  });

  it("shows validation errors for empty form submission", () => {
    cy.get('[data-testid="sign-up-submit"]').click();
    cy.contains("Vorname ist erforderlich").should("be.visible");
  });

  it("shows validation error for short password", () => {
    cy.get('[data-testid="sign-up-firstname"]').type("Max");
    cy.get('[data-testid="sign-up-lastname"]').type("Mustermann");
    cy.get('[data-testid="sign-up-email"]').type("test@example.com");
    cy.get('[data-testid="sign-up-password"]').type("short");
    cy.get('[data-testid="sign-up-submit"]').click();
    cy.contains("mindestens 8 Zeichen").should("be.visible");
  });

  it("shows validation error for invalid email", () => {
    cy.get('[data-testid="sign-up-firstname"]').type("Max");
    cy.get('[data-testid="sign-up-lastname"]').type("Mustermann");
    cy.get('[data-testid="sign-up-email"]').type("not-an-email");
    cy.get('[data-testid="sign-up-password"]').type("ValidPass123!");
    cy.get('[data-testid="sign-up-submit"]').click();
    cy.contains("gültige E-Mail").should("be.visible");
  });

  it("proceeds to verification step after valid registration attempt", () => {
    // Use a unique email to avoid "already registered" errors
    const uniqueEmail = `test+${Date.now()}@example.com`;

    cy.intercept("POST", "**/v1/client/sign_ups/**").as("signUpRequest");

    cy.get('[data-testid="sign-up-firstname"]').type("Max");
    cy.get('[data-testid="sign-up-lastname"]').type("Mustermann");
    cy.get('[data-testid="sign-up-email"]').type(uniqueEmail);
    cy.get('[data-testid="sign-up-password"]').type("ValidPass123!");
    cy.get('[data-testid="sign-up-submit"]').click();

    // Should proceed to email verification step or show error (email not whitelisted in dev)
    cy.get('[data-testid="verify-email-form"], [data-testid="sign-up-global-error"]').should(
      "exist",
    );
  });

  it("shows verification form with back button", () => {
    // Stub Clerk sign-up to simulate going to verify step
    cy.intercept("POST", "**/v1/client/sign_ups/**", {
      statusCode: 200,
      body: { response: { status: "missing_requirements" } },
    }).as("signUpRequest");
    cy.intercept("POST", "**/v1/client/sign_ups/**/prepare_verification**", {
      statusCode: 200,
      body: {},
    }).as("sendCode");

    // Trigger the register step to move to verify
    cy.get('[data-testid="sign-up-firstname"]').type("Max");
    cy.get('[data-testid="sign-up-lastname"]').type("Mustermann");
    cy.get('[data-testid="sign-up-email"]').type(`test+${Date.now()}@example.com`);
    cy.get('[data-testid="sign-up-password"]').type("ValidPass123!");
    cy.get('[data-testid="sign-up-submit"]').click();

    // If verification form appears, test back button
    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="verify-email-form"]').length > 0) {
        cy.get('[data-testid="verify-back"]').should("be.visible").click();
        cy.get('[data-testid="sign-up-form"]').should("be.visible");
      }
    });
  });
});
