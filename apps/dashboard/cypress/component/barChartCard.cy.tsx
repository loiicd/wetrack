import BarChartCard from "../../components/charts/barChartCard";
import type { DataFrame } from "../../types/dataframe";

const sampleData: DataFrame = {
  fields: [
    {
      name: "product",
      type: "string",
      values: ["Apples", "Bananas", "Cherries"],
    },
    { name: "revenue", type: "number", values: [300, 500, 150] },
  ],
};

const multiSeriesData: DataFrame = {
  fields: [
    { name: "month", type: "string", values: ["Jan", "Feb", "Mar"] },
    { name: "online", type: "number", values: [200, 350, 410] },
    { name: "offline", type: "number", values: [120, 180, 220] },
  ],
};

const emptyData: DataFrame = { fields: [] };

const baseConfig = {
  orientation: "vertical" as const,
  stacked: false,
  showLabels: false,
  showTooltip: true,
  showCard: true,
};

describe("BarChartCard", () => {
  it("renders with vertical orientation (default)", () => {
    cy.mount(
      <BarChartCard
        title="Vertical Bar Chart"
        data={sampleData}
        config={{
          ...baseConfig,
          categoryField: "product",
          valueFields: ["revenue"],
        }}
      />,
    );
    cy.contains("Vertical Bar Chart").should("be.visible");
    // recharts renders an SVG
    cy.get("svg").should("exist");
  });

  it("renders with horizontal orientation", () => {
    cy.mount(
      <BarChartCard
        title="Horizontal Bar Chart"
        data={sampleData}
        config={{
          ...baseConfig,
          orientation: "horizontal",
          categoryField: "product",
          valueFields: ["revenue"],
        }}
      />,
    );
    cy.contains("Horizontal Bar Chart").should("be.visible");
    cy.get("svg").should("exist");
  });

  it("renders multiple value series (grouped bars)", () => {
    cy.mount(
      <BarChartCard
        title="Multi-Series"
        data={multiSeriesData}
        config={{
          ...baseConfig,
          categoryField: "month",
          valueFields: ["online", "offline"],
        }}
      />,
    );
    cy.get("svg").should("exist");
  });

  it("renders stacked bars", () => {
    cy.mount(
      <BarChartCard
        title="Stacked"
        data={multiSeriesData}
        config={{
          ...baseConfig,
          stacked: true,
          categoryField: "month",
          valueFields: ["online", "offline"],
        }}
      />,
    );
    cy.get("svg").should("exist");
  });

  it("shows an empty-data message when data has no matching categoryField", () => {
    cy.mount(
      <BarChartCard
        title="Empty Chart"
        data={emptyData}
        config={{
          ...baseConfig,
          categoryField: "product",
          valueFields: ["revenue"],
        }}
      />,
    );
    cy.contains("Keine Daten für dieses Chart.").should("be.visible");
  });

  it("renders without a card border when showCard is false", () => {
    cy.mount(
      <BarChartCard
        title="No Card"
        data={sampleData}
        config={{
          ...baseConfig,
          showCard: false,
          categoryField: "product",
          valueFields: ["revenue"],
        }}
      />,
    );
    cy.get("svg").should("exist");
  });

  it("renders with description", () => {
    cy.mount(
      <BarChartCard
        title="With Description"
        description="Shows product revenue"
        data={sampleData}
        config={{
          ...baseConfig,
          categoryField: "product",
          valueFields: ["revenue"],
        }}
      />,
    );
    cy.contains("Shows product revenue").should("be.visible");
  });
});
