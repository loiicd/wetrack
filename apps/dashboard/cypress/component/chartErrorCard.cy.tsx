import ChartErrorCard from "@/components/charts/chartErrorCard";

describe("ChartErrorCard", () => {
  it("renders the chart title", () => {
    cy.mount(
      <ChartErrorCard title="Revenue Chart" message="DataSource not reachable" />,
    );
    cy.contains("Revenue Chart").should("be.visible");
  });

  it("renders a user-friendly hint (not the raw error)", () => {
    cy.mount(
      <ChartErrorCard title="Revenue Chart" message="DataSource not reachable" />,
    );
    // Raw message is hidden behind the details toggle; hint is always visible
    cy.contains("Die Datenquelle konnte nicht erreicht werden.").should("be.visible");
  });

  it("categorizes a network error correctly", () => {
    cy.mount(
      <ChartErrorCard title="Net Chart" message="fetch failed: ECONNREFUSED" />,
    );
    cy.contains("API-Fehler").should("be.visible");
  });

  it("categorizes a SQL/query error correctly", () => {
    cy.mount(
      <ChartErrorCard title="SQL Chart" message="alasql: syntax error near FROM" />,
    );
    cy.contains("Abfrage-Fehler").should("be.visible");
  });

  it("categorizes a config error correctly", () => {
    cy.mount(
      <ChartErrorCard title="Config Chart" message="zod: invalid field type" />,
    );
    cy.contains("Konfigurations-Fehler").should("be.visible");
  });

  it("hides technical details by default and shows them after toggle", () => {
    const rawMsg = "ECONNREFUSED 127.0.0.1:5432";
    cy.mount(<ChartErrorCard title="Detail Test" message={rawMsg} />);
    // Raw message should NOT be visible initially
    cy.contains(rawMsg).should("not.exist");
    // Click to expand
    cy.contains("Technische Details").click();
    cy.contains(rawMsg).should("be.visible");
    // Click again to collapse
    cy.contains("Technische Details").click();
    cy.contains(rawMsg).should("not.exist");
  });

  it("renders a refresh button", () => {
    cy.mount(
      <ChartErrorCard title="Error" message="Something went wrong" />,
    );
    cy.get('button[title="Aktualisieren"]').should("exist");
  });

  it("renders an icon SVG", () => {
    cy.mount(
      <ChartErrorCard title="Icon Test" message="timeout" />,
    );
    cy.get("svg").should("exist");
  });
});
