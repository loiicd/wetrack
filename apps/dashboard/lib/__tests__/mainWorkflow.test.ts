import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks – vi.hoisted so factories run before module imports
// ---------------------------------------------------------------------------
const mocks = vi.hoisted(() => ({
  stackInterface: { create: vi.fn() },
  dashboardInterface: { createMany: vi.fn(), getByStackId: vi.fn(), deleteNotInKeys: vi.fn() },
  dataSourceInterface: { createMany: vi.fn(), getByStackId: vi.fn(), deleteNotInKeys: vi.fn() },
  queryInterface: {
    createMany: vi.fn(),
    getByStackId: vi.fn(),
    updateSourceQueryId: vi.fn(),
    deleteNotInKeys: vi.fn(),
  },
  chartInterface: { createMany: vi.fn(), deleteNotInKeys: vi.fn() },
}));

vi.mock("@/lib/database/stack", () => ({ stackInterface: mocks.stackInterface }));
vi.mock("@/lib/database/dashboard", () => ({ dashboardInterface: mocks.dashboardInterface }));
vi.mock("@/lib/database/dataSource", () => ({ dataSourceInterface: mocks.dataSourceInterface }));
vi.mock("@/lib/database/query", () => ({ queryInterface: mocks.queryInterface }));
vi.mock("@/lib/database/chart", () => ({ chartInterface: mocks.chartInterface }));

import { mainWorkflow } from "../workflows/main";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const STACK_ID = "stack-id-1";
const ORG_ID = "org_123";

const baseStackData = () => ({
  key: "my-stack",
  environment: "PRODUCTION" as const,
  dashboards: [{ key: "dash-1", label: "Dashboard 1", description: "desc" }],
  dataSources: [
    { key: "ds-1", type: "rest" as const, config: { url: "https://api.example.com", method: "get" as const } },
  ],
  queries: [
    { key: "q-1", type: "jsonpath" as const, dataSource: "ds-1", jsonPath: "$[*]" },
  ],
  charts: [
    {
      key: "chart-1",
      label: "Bar Chart",
      type: "bar" as const,
      dashboard: "dash-1",
      query: "q-1",
      config: { categoryField: "id", valueFields: ["value"], orientation: "vertical" as const },
    },
  ],
});

const setupDefaultMocks = () => {
  mocks.stackInterface.create.mockResolvedValue(STACK_ID);
  mocks.dashboardInterface.createMany.mockResolvedValue(undefined);
  mocks.dashboardInterface.getByStackId.mockResolvedValue([{ key: "dash-1", id: "dash-id-1" }]);
  mocks.dashboardInterface.deleteNotInKeys.mockResolvedValue(undefined);
  mocks.dataSourceInterface.createMany.mockResolvedValue(undefined);
  mocks.dataSourceInterface.getByStackId.mockResolvedValue([{ key: "ds-1", id: "ds-id-1" }]);
  mocks.dataSourceInterface.deleteNotInKeys.mockResolvedValue(undefined);
  mocks.queryInterface.createMany.mockResolvedValue(undefined);
  mocks.queryInterface.getByStackId.mockResolvedValue([{ key: "q-1", id: "q-id-1" }]);
  mocks.queryInterface.updateSourceQueryId.mockResolvedValue(undefined);
  mocks.queryInterface.deleteNotInKeys.mockResolvedValue(undefined);
  mocks.chartInterface.createMany.mockResolvedValue(undefined);
  mocks.chartInterface.deleteNotInKeys.mockResolvedValue(undefined);
};

beforeEach(() => {
  vi.clearAllMocks();
  setupDefaultMocks();
});

// ===========================================================================
// mainWorkflow
// ===========================================================================
describe("mainWorkflow", () => {
  it("creates stack, dashboards, data sources, queries, and charts", async () => {
    await mainWorkflow(baseStackData() as never, ORG_ID);

    expect(mocks.stackInterface.create).toHaveBeenCalledWith(
      expect.objectContaining({ key: "my-stack", environment: "PRODUCTION", orgId: ORG_ID }),
    );
    expect(mocks.dashboardInterface.createMany).toHaveBeenCalled();
    expect(mocks.dataSourceInterface.createMany).toHaveBeenCalled();
    expect(mocks.queryInterface.createMany).toHaveBeenCalled();
    expect(mocks.chartInterface.createMany).toHaveBeenCalled();
  });

  it("cleans up deleted resources in correct order", async () => {
    await mainWorkflow(baseStackData() as never, ORG_ID);

    expect(mocks.chartInterface.deleteNotInKeys).toHaveBeenCalledWith(STACK_ID, ["chart-1"]);
    expect(mocks.queryInterface.deleteNotInKeys).toHaveBeenCalledWith(STACK_ID, ["q-1"]);
    expect(mocks.dataSourceInterface.deleteNotInKeys).toHaveBeenCalledWith(STACK_ID, ["ds-1"]);
    expect(mocks.dashboardInterface.deleteNotInKeys).toHaveBeenCalledWith(STACK_ID, ["dash-1"]);
  });

  it("handles empty optional arrays gracefully", async () => {
    const data = {
      key: "empty-stack",
      environment: "STAGING" as const,
      dashboards: [],
      dataSources: [],
      queries: [],
      charts: [],
    };

    await mainWorkflow(data as never, ORG_ID);

    expect(mocks.dashboardInterface.createMany).not.toHaveBeenCalled();
    expect(mocks.dataSourceInterface.createMany).not.toHaveBeenCalled();
    expect(mocks.queryInterface.createMany).not.toHaveBeenCalled();
    expect(mocks.chartInterface.createMany).not.toHaveBeenCalled();
  });

  it("handles undefined optional arrays gracefully", async () => {
    const data = { key: "min-stack", environment: "DEVELOPMENT" as const };

    await mainWorkflow(data as never as never, ORG_ID);

    expect(mocks.dashboardInterface.createMany).not.toHaveBeenCalled();
  });

  describe("chart type mapping", () => {
    const makeChart = (type: string, config: object) => ({
      ...baseStackData(),
      charts: [
        { key: "c", label: "C", type, dashboard: "dash-1", query: "q-1", config } as never,
      ],
    });

    it("maps 'line' chart type to LINE", async () => {
      await mainWorkflow(makeChart("line", { xField: "x", valueFields: ["y"] }) as never, ORG_ID);
      const call = mocks.chartInterface.createMany.mock.calls[0][0];
      expect(call[0].type).toBe("LINE");
    });

    it("maps 'stat' chart type to STAT", async () => {
      await mainWorkflow(makeChart("stat", { valueField: "v" }) as never, ORG_ID);
      const call = mocks.chartInterface.createMany.mock.calls[0][0];
      expect(call[0].type).toBe("STAT");
    });

    it("maps 'bar' chart type to BAR", async () => {
      await mainWorkflow(baseStackData() as never, ORG_ID);
      const call = mocks.chartInterface.createMany.mock.calls[0][0];
      expect(call[0].type).toBe("BAR");
    });

    it("maps 'clock' chart type to CLOCK with null queryId", async () => {
      const data = {
        ...baseStackData(),
        charts: [
          {
            key: "clock-1",
            label: "Clock",
            type: "clock" as const,
            dashboard: "dash-1",
            config: { timeZone: "Europe/Berlin" },
          },
        ],
      };
      await mainWorkflow(data as never as never, ORG_ID);
      const call = mocks.chartInterface.createMany.mock.calls[0][0];
      expect(call[0].type).toBe("CLOCK");
      expect(call[0].queryId).toBeNull();
    });
  });

  describe("SQL query type", () => {
    it("maps sql query type to SQL QueryType", async () => {
      const data = {
        ...baseStackData(),
        queries: [
          { key: "sql-q", type: "sql" as const, dataSource: "ds-1", sql: "SELECT * FROM ?" },
        ],
        charts: [
          { ...baseStackData().charts[0], query: "sql-q" },
        ],
      };
      mocks.queryInterface.getByStackId.mockResolvedValue([{ key: "sql-q", id: "sq-id" }]);

      await mainWorkflow(data as never, ORG_ID);

      const createManyCall = mocks.queryInterface.createMany.mock.calls[0][0];
      expect(createManyCall[0].type).toBe("SQL");
      expect(createManyCall[0].sql).toBe("SELECT * FROM ?");
    });
  });

  describe("sourceQuery linking", () => {
    it("sets sourceQueryId for queries that reference another query", async () => {
      const data = {
        ...baseStackData(),
        queries: [
          { key: "q-base", type: "jsonpath" as const, dataSource: "ds-1", jsonPath: "$[*]" },
          { key: "q-derived", type: "sql" as const, sourceQuery: "q-base", sql: "SELECT * FROM ?" },
        ],
        charts: [{ ...baseStackData().charts[0], query: "q-derived" }],
      };

      mocks.queryInterface.getByStackId.mockResolvedValue([
        { key: "q-base", id: "qid-base" },
        { key: "q-derived", id: "qid-derived" },
      ]);

      await mainWorkflow(data as never, ORG_ID);

      expect(mocks.queryInterface.updateSourceQueryId).toHaveBeenCalledWith(
        "qid-derived",
        "qid-base",
      );
    });
  });

  describe("error handling", () => {
    it("throws when chart references unknown dashboard", async () => {
      const data = {
        ...baseStackData(),
        charts: [{ ...baseStackData().charts[0], dashboard: "nonexistent" }],
      };

      await expect(mainWorkflow(data as never, ORG_ID)).rejects.toThrow(
        "Dashboard with key 'nonexistent' not found",
      );
    });

    it("throws when chart references unknown query", async () => {
      const data = {
        ...baseStackData(),
        charts: [{ ...baseStackData().charts[0], query: "nonexistent-query" }],
      };

      await expect(mainWorkflow(data as never, ORG_ID)).rejects.toThrow(
        "Query with key 'nonexistent-query' not found",
      );
    });

    it("throws when query references unknown dataSource", async () => {
      const data = {
        ...baseStackData(),
        queries: [{ key: "q-bad", type: "jsonpath" as const, dataSource: "bad-ds", jsonPath: "$" }],
      };
      // dataSourceMap will be empty (no matching datasource in DB)
      mocks.dataSourceInterface.getByStackId.mockResolvedValue([]);

      await expect(mainWorkflow(data as never, ORG_ID)).rejects.toThrow(
        "DataSource 'bad-ds' nicht gefunden",
      );
    });

    it("uses layout defaults when chart has no layout defined", async () => {
      await mainWorkflow(baseStackData() as never, ORG_ID);
      const call = mocks.chartInterface.createMany.mock.calls[0][0];
      // First chart, index 0 → defaultX=0, defaultY=0
      expect(call[0].layoutX).toBe(0);
      expect(call[0].layoutY).toBe(0);
      expect(call[0].layoutW).toBe(6);
      expect(call[0].layoutH).toBe(3);
    });

    it("uses explicit layout when provided", async () => {
      const data = {
        ...baseStackData(),
        charts: [
          {
            ...baseStackData().charts[0],
            layout: { x: 3, y: 2, w: 9, h: 4 },
          },
        ],
      };

      await mainWorkflow(data as never, ORG_ID);
      const call = mocks.chartInterface.createMany.mock.calls[0][0];
      expect(call[0].layoutX).toBe(3);
      expect(call[0].layoutY).toBe(2);
      expect(call[0].layoutW).toBe(9);
      expect(call[0].layoutH).toBe(4);
    });
  });
});
