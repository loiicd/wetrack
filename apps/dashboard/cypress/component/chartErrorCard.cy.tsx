import ChartErrorCard from "@/components/charts/chartErrorCard";

describe("ChartErrorCard", () => {
  it("renders the chart title", () => {
    cy.mount(
      <ChartErrorCard
        title="Revenue Chart"
        message="DataSource not reachable"
      />,
    );
    cy.contains("Revenue Chart").should("be.visible");
  });

  it("renders the error message", () => {
    cy.mount(
      <ChartErrorCard
        title="Revenue Chart"
        message="DataSource not reachable"
      />,
    );
    cy.contains("DataSource not reachable").should("be.visible");
  });

  it("renders a generic subtitle about the loading failure", () => {
    cy.mount(
      <ChartErrorCard title="My Chart" message="Timeout" />,
    );
    cy.contains("Chart konnte nicht geladen werden.").should("be.visible");
  });

  it("renders the alert icon", () => {
    cy.mount(
      <ChartErrorCard title="Error" message="Something went wrong" />,
    );
    // lucide-react renders an SVG
    cy.get("svg").should("exist");
  });

  it("renders long error messages without layout breakage", () => {
    const longMessage =
      "Error: ECONNREFUSED – Connection refused by host 192.168.1.100:5432 after 3 retries. " +
      "Check that the database server is running and that the network is reachable.";
    cy.mount(
      <ChartErrorCard title="DB Error" message={longMessage} />,
    );
    cy.contains(longMessage).should("be.visible");
  });
});
