import { describe, it, expect, vi, beforeEach } from "vitest";

// Hoisted mocks – mirror mainWorkflow.test
const mocks = vi.hoisted(() => ({
  prisma: { $transaction: vi.fn() },
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

vi.mock("@/lib/database/prisma", () => ({ default: mocks.prisma }));
vi.mock("@/lib/database/stack", () => ({ stackInterface: mocks.stackInterface }));
vi.mock("@/lib/database/dashboard", () => ({ dashboardInterface: mocks.dashboardInterface }));
vi.mock("@/lib/database/dataSource", () => ({ dataSourceInterface: mocks.dataSourceInterface }));
vi.mock("@/lib/database/query", () => ({ queryInterface: mocks.queryInterface }));
vi.mock("@/lib/database/chart", () => ({ chartInterface: mocks.chartInterface }));

import { mainWorkflow } from "@/lib/workflows/main";

const ORG_ID = "org_123";
const TX = { __tx: true } as const;

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
      label: "C",
      type: "cartesian" as const,
      dashboard: "dash-1",
      query: "q-1",
      config: { categoryField: "id", valueFields: ["value"], orientation: "vertical" as const },
    },
  ],
});

const setupDefaultMocks = () => {
  mocks.prisma.$transaction.mockImplementation(async (callback: (tx: typeof TX) => Promise<unknown>) =>
    callback(TX),
  );
  mocks.stackInterface.create.mockResolvedValue("stack-id-1");
  mocks.dashboardInterface.createMany.mockResolvedValue(undefined);
  mocks.dashboardInterface.getByStackId.mockResolvedValue([{ key: "dash-1", id: "dash-id-1" }]);
  mocks.dashboardInterface.deleteNotInKeys.mockResolvedValue(undefined);
  mocks.dataSourceInterface.createMany.mockResolvedValue(undefined);
  mocks.dataSourceInterface.getByStackId.mockResolvedValue([{ key: "ds-1", id: "ds-id-1" }]);
  mocks.dataSourceInterface.deleteNotInKeys.mockResolvedValue(undefined);
  mocks.queryInterface.createMany.mockResolvedValue(undefined);
  mocks.queryInterface.getByStackId.mockResolvedValue([{ key: "q-1", id: "q-id-1" }, { key: "q-json", id: "q-json-id" }]);
  mocks.queryInterface.updateSourceQueryId.mockResolvedValue(undefined);
  mocks.queryInterface.deleteNotInKeys.mockResolvedValue(undefined);
  mocks.chartInterface.createMany.mockResolvedValue(undefined);
  mocks.chartInterface.deleteNotInKeys.mockResolvedValue(undefined);
};

beforeEach(() => {
  vi.clearAllMocks();
  setupDefaultMocks();
});

describe("mainWorkflow - extra coverage", () => {
  it("ensures jsonpath-created queries include sql:null", async () => {
    const data = {
      ...baseStackData(),
      queries: [{ key: "q-json", type: "jsonpath" as const, dataSource: "ds-1", jsonPath: "$[*]" }],
      charts: [
        {
          key: "chart-1",
          label: "C",
          type: "cartesian" as const,
          dashboard: "dash-1",
          query: "q-json",
          config: { categoryField: "id", valueFields: ["value"], orientation: "vertical" as const },
        },
      ],
    };

    await mainWorkflow(data as never, ORG_ID);

    const createManyCall = mocks.queryInterface.createMany.mock.calls[0][0];
    const created = createManyCall.find((q: any) => q.key === "q-json");
    expect(created).toBeDefined();
    expect(created.jsonPath).toBe("$[*]");
    expect(created.sql).toBeNull();
  });
});
