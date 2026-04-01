import StatCard from "@/components/charts/statCard";
import type { DataFrame } from "@/types/dataframe";

const numericData: DataFrame = {
  fields: [{ name: "total", type: "number", values: [42500.75] }],
};

const stringData: DataFrame = {
  fields: [{ name: "status", type: "string", values: ["Active"] }],
};

const emptyData: DataFrame = { fields: [] };

describe("StatCard", () => {
  it("renders a numeric value", () => {
    cy.mount(
      <StatCard
        title="Total Revenue"
        data={numericData}
        config={{ valueField: "total", showCard: true }}
      />,
    );
    cy.contains("Total Revenue").should("be.visible");
    cy.contains("42500.75").should("be.visible");
  });

  it("formats value with fixed decimal places", () => {
    cy.mount(
      <StatCard
        title="Revenue"
        data={numericData}
        config={{ valueField: "total", decimals: 2, showCard: true }}
      />,
    );
    cy.contains("42500.75").should("be.visible");
  });

  it("appends a unit to the displayed value", () => {
    cy.mount(
      <StatCard
        title="Revenue"
        data={numericData}
        config={{ valueField: "total", decimals: 0, unit: "€", showCard: true }}
      />,
    );
    cy.contains("42501 €").should("be.visible");
  });

  it("renders a string value", () => {
    cy.mount(
      <StatCard
        title="Status"
        data={stringData}
        config={{ valueField: "status", showCard: true }}
      />,
    );
    cy.contains("Active").should("be.visible");
  });

  it("shows a fallback dash when the valueField is not present", () => {
    cy.mount(
      <StatCard
        title="Missing"
        data={emptyData}
        config={{ valueField: "nonexistent", showCard: true }}
      />,
    );
    cy.contains("–").should("be.visible");
  });

  it("renders without a card border when showCard is false", () => {
    cy.mount(
      <StatCard
        title="No Card Stat"
        data={numericData}
        config={{ valueField: "total", showCard: false }}
      />,
    );
    cy.contains("42500.75").should("be.visible");
  });

  it("renders with a description", () => {
    cy.mount(
      <StatCard
        title="Revenue"
        description="Current month total"
        data={numericData}
        config={{ valueField: "total", showCard: true }}
      />,
    );
    cy.contains("Current month total").should("be.visible");
  });
});
