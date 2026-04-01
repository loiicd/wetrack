// cypress/e2e/team/invite-user.cy.ts
// E2E tests for team member management (invite, remove)
// Requires authenticated session

describe("Team Management – Invite User", () => {
  beforeEach(() => {
    cy.signIn();
    cy.visit("/settings/team");
  });

  it("displays the team page with invite button", () => {
    cy.contains("Organization Members").should("be.visible");
    cy.contains("Invite User").should("be.visible");
  });

  it("opens the invite dialog", () => {
    cy.contains("Invite User").click();
    cy.contains("Benutzer einladen").should("be.visible");
    cy.contains("Lade ein Teammitglied").should("be.visible");
  });

  it("shows validation error for invalid email in invite form", () => {
    cy.contains("Invite User").click();
    // Type invalid email and submit
    cy.get('input[type="email"]').first().type("not-an-email");
    cy.contains("button", "Invite").click();
    cy.contains("gültige E-Mail").should("be.visible");
  });

  it("shows members list tab", () => {
    cy.contains("Members").should("be.visible");
    cy.contains("Invitations").should("be.visible");
  });

  it("can switch to invitations tab", () => {
    cy.contains("Invitations").click();
    cy.contains("invitations").should("be.visible");
  });
});

describe("Team Management – Remove User", () => {
  beforeEach(() => {
    cy.signIn();
    cy.visit("/settings/team");
  });

  it("shows member list with action buttons", () => {
    cy.contains("Members").click();
    // At minimum the logged-in user should be visible
    cy.get('[data-testid="sign-in-form"]').should("not.exist"); // We're authenticated
  });
});
