import LineChartCard from "@/components/charts/lineChartCard";
import type { DataFrame } from "@/types/dataframe";

const sampleData: DataFrame = {
  fields: [
    { name: "month", type: "string", values: ["Jan", "Feb", "Mar", "Apr"] },
    { name: "revenue", type: "number", values: [1200, 1800, 1400, 2100] },
  ],
};

const multiSeriesData: DataFrame = {
  fields: [
    { name: "month", type: "string", values: ["Jan", "Feb", "Mar"] },
    { name: "revenue", type: "number", values: [1200, 1800, 1400] },
    { name: "profit", type: "number", values: [300, 500, 420] },
  ],
};

const emptyData: DataFrame = { fields: [] };

const baseConfig = {
  showDots: true,
  filled: false,
  showTooltip: true,
  showLabels: false,
  showCard: true,
};

describe("LineChartCard", () => {
  it("renders a line chart with default options", () => {
    cy.mount(
      <LineChartCard
        title="Monthly Revenue"
        data={sampleData}
        config={{ ...baseConfig, xField: "month", valueFields: ["revenue"] }}
      />,
    );
    cy.contains("Monthly Revenue").should("be.visible");
    cy.get("svg").should("exist");
  });

  it("renders multiple lines for multiple valueFields", () => {
    cy.mount(
      <LineChartCard
        title="Revenue vs Profit"
        data={multiSeriesData}
        config={{ ...baseConfig, xField: "month", valueFields: ["revenue", "profit"] }}
      />,
    );
    cy.get("svg").should("exist");
    // Two Line elements should be present
    cy.get(".recharts-line").should("have.length", 2);
  });

  it("renders with dots hidden when showDots is false", () => {
    cy.mount(
      <LineChartCard
        title="No Dots"
        data={sampleData}
        config={{ ...baseConfig, xField: "month", valueFields: ["revenue"], showDots: false }}
      />,
    );
    cy.get("svg").should("exist");
    cy.get(".recharts-dot").should("not.exist");
  });

  it("renders with filled area when filled is true", () => {
    cy.mount(
      <LineChartCard
        title="Filled Area"
        data={sampleData}
        config={{ ...baseConfig, xField: "month", valueFields: ["revenue"], filled: true }}
      />,
    );
    cy.get("svg").should("exist");
  });

  it("shows an empty-data message when xField does not match any column", () => {
    cy.mount(
      <LineChartCard
        title="Empty Line Chart"
        data={emptyData}
        config={{ ...baseConfig, xField: "month", valueFields: ["revenue"] }}
      />,
    );
    cy.contains("Keine Daten für dieses Chart.").should("be.visible");
  });

  it("renders without a card border when showCard is false", () => {
    cy.mount(
      <LineChartCard
        title="No Card"
        data={sampleData}
        config={{ ...baseConfig, xField: "month", valueFields: ["revenue"], showCard: false }}
      />,
    );
    cy.get("svg").should("exist");
  });

  it("renders with a description", () => {
    cy.mount(
      <LineChartCard
        title="Revenue Trend"
        description="Revenue over the last 4 months"
        data={sampleData}
        config={{ ...baseConfig, xField: "month", valueFields: ["revenue"] }}
      />,
    );
    cy.contains("Revenue over the last 4 months").should("be.visible");
  });
});
