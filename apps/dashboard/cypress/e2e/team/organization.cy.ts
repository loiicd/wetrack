// cypress/e2e/team/organization.cy.ts
// E2E tests for organization management (create, delete)

describe("Create Organization", () => {
  beforeEach(() => {
    cy.signIn();
    cy.visit("/");
    // Open the sidebar org switcher dropdown to reveal "Create organization"
    cy.get('[data-testid="org-switcher-trigger"]', { timeout: 10000 }).click();
  });

  it("can open create organization dialog from sidebar", () => {
    cy.contains("Create organization").should("be.visible");
  });

  it("shows create organization form with name input", () => {
    cy.contains("Create organization").click();
    cy.get('[data-testid="create-org-form"]').should("be.visible");
    cy.get('[data-testid="create-org-name"]').should("be.visible");
    cy.get('[data-testid="create-org-submit"]').should("be.visible");
  });

  it("shows validation error for short org name", () => {
    cy.contains("Create organization").click();
    cy.get('[data-testid="create-org-name"]').type("A");
    cy.get('[data-testid="create-org-submit"]').click();
    cy.contains("mindestens 2 Zeichen").should("be.visible");
  });

  it("shows validation error for empty org name", () => {
    cy.contains("Create organization").click();
    cy.get('[data-testid="create-org-submit"]').click();
    cy.contains("mindestens 2 Zeichen").should("be.visible");
  });
});

describe("Delete Organization", () => {
  beforeEach(() => {
    cy.signIn();
    cy.visit("/settings/team");
  });

  it("shows danger zone section", () => {
    cy.contains("Gefahrenzone").should("be.visible");
  });

  it("shows delete organization button", () => {
    cy.get('[data-testid="delete-org-trigger"]').should("be.visible");
  });

  it("opens delete confirmation dialog", () => {
    cy.get('[data-testid="delete-org-trigger"]').first().click();
    cy.get('[data-testid="delete-org-dialog"]').should("be.visible");
    cy.contains("Organisation löschen").should("be.visible");
    cy.contains("unwiderruflich").should("be.visible");
  });

  it("disables submit when confirmation input is empty", () => {
    cy.get('[data-testid="delete-org-trigger"]').first().click();
    cy.get('[data-testid="delete-org-confirm-submit"]').click();
    // Should show validation error (name doesn't match)
    cy.get('[data-testid="delete-org-confirm-input"]').should("be.visible");
  });

  it("shows error when confirmation name doesn't match", () => {
    cy.get('[data-testid="delete-org-trigger"]').first().click();
    cy.get('[data-testid="delete-org-confirm-input"]').type(
      "wrong organization name",
    );
    cy.get('[data-testid="delete-org-confirm-submit"]').click();
    cy.contains("ein, um zu bestätigen").should("be.visible");
  });
});
