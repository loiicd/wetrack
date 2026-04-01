import ChartGrid from "@/components/chartGrid";
import ChartErrorCard from "@/components/charts/chartErrorCard";
import StatCard from "@/components/charts/statCard";
import type { DataFrame } from "@/types/dataframe";

const statData: DataFrame = {
  fields: [{ name: "value", type: "number", values: [42] }],
};

const statConfig = { valueField: "value", showCard: true as const };

describe("ChartGrid", () => {
  it("renders without crashing with no widgets", () => {
    cy.mount(<ChartGrid widgets={[]} />);
    cy.get("[style]").should("exist");
  });

  it("renders a single widget", () => {
    cy.mount(
      <ChartGrid
        widgets={[
          {
            id: "w1",
            x: 0,
            y: 0,
            w: 6,
            h: 2,
            content: (
              <StatCard title="Revenue" data={statData} config={statConfig} />
            ),
          },
        ]}
      />,
    );
    cy.contains("Revenue").should("be.visible");
  });

  it("renders multiple widgets", () => {
    cy.mount(
      <ChartGrid
        widgets={[
          {
            id: "w1",
            x: 0,
            y: 0,
            w: 6,
            h: 2,
            content: (
              <StatCard title="Widget A" data={statData} config={statConfig} />
            ),
          },
          {
            id: "w2",
            x: 6,
            y: 0,
            w: 6,
            h: 2,
            content: (
              <StatCard title="Widget B" data={statData} config={statConfig} />
            ),
          },
        ]}
      />,
    );
    cy.contains("Widget A").should("be.visible");
    cy.contains("Widget B").should("be.visible");
  });

  it("renders an error card inside the grid", () => {
    cy.mount(
      <ChartGrid
        widgets={[
          {
            id: "err",
            x: 0,
            y: 0,
            w: 12,
            h: 3,
            content: (
              <ChartErrorCard
                title="Broken Chart"
                message="fetch failed: ECONNREFUSED"
              />
            ),
          },
        ]}
      />,
    );
    cy.contains("Broken Chart").should("be.visible");
    cy.contains("API-Fehler").should("be.visible");
  });

  it("positions widgets using absolute positioning", () => {
    cy.mount(
      <ChartGrid
        widgets={[
          {
            id: "positioned",
            x: 0,
            y: 1,
            w: 6,
            h: 2,
            content: <StatCard title="Positioned" data={statData} config={statConfig} />,
          },
        ]}
      />,
    );
    // The grid container should have position: relative
    cy.get("[style*='position: relative']").should("exist");
    // The widget should be absolutely positioned with a top offset (y=1 means top > 0)
    cy.get("[style*='position: absolute']")
      .should("have.attr", "style")
      .and("match", /top:\s*[1-9]/);
  });

  it("renders with custom gap and rowHeight", () => {
    cy.mount(
      <ChartGrid
        gap={20}
        rowHeight={200}
        widgets={[
          {
            id: "custom",
            x: 0,
            y: 0,
            w: 12,
            h: 1,
            content: <StatCard title="Custom" data={statData} config={statConfig} />,
          },
        ]}
      />,
    );
    cy.contains("Custom").should("be.visible");
  });
});
