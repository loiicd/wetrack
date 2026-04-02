import { mount } from "cypress/react";
import Chart from "../../components/charts/test/chart";

describe("TestChart Komponententest", () => {
  it("rendert das Chart und zeigt den Titel", () => {
    mount(<Chart />);
    cy.contains("Test Chart").should("be.visible");
    cy.contains("Ein einfaches Test-Chart mit statischen Daten.").should(
      "be.visible",
    );
    cy.get("rect").should("exist");
  });
});
