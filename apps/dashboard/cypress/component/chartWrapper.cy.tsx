import ChartWrapper from "@/components/chartWrapper";

describe("ChartWrapper", () => {
  it("renders children inside a card by default", () => {
    cy.mount(
      <ChartWrapper title="Test Title">
        <p data-cy="content">Hello</p>
      </ChartWrapper>,
    );
    cy.get("[data-cy=content]").should("be.visible").and("contain", "Hello");
  });

  it("displays title and description in the card header", () => {
    cy.mount(
      <ChartWrapper title="Revenue" description="Monthly revenue overview">
        <span>Chart</span>
      </ChartWrapper>,
    );
    cy.contains("Revenue").should("be.visible");
    cy.contains("Monthly revenue overview").should("be.visible");
  });

  it("renders without a card border when showCard is false", () => {
    cy.mount(
      <ChartWrapper title="No Card" showCard={false}>
        <span data-cy="inner">inner</span>
      </ChartWrapper>,
    );
    // No Card element rendered, but content is still visible
    cy.get("[data-cy=inner]").should("be.visible");
    cy.get(".border").should("not.exist");
  });

  it("renders children without a header when title and description are omitted", () => {
    cy.mount(
      <ChartWrapper>
        <p data-cy="content">Only content</p>
      </ChartWrapper>,
    );
    cy.get("[data-cy=content]").should("be.visible");
    cy.get("header").should("not.exist");
  });

  it("applies custom className to the outer element", () => {
    cy.mount(
      <ChartWrapper className="custom-class">
        <span>Content</span>
      </ChartWrapper>,
    );
    cy.get(".custom-class").should("exist");
  });
});
