import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  mainWorkflow: vi.fn(),
  dashboardInterface: { getByStackId: vi.fn() },
  chartInterface: { getByDashboardId: vi.fn() },
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: mocks.auth,
}));

vi.mock("@/lib/workflows/main", () => ({
  mainWorkflow: mocks.mainWorkflow,
}));

vi.mock("@/lib/database/dashboard", () => ({
  dashboardInterface: mocks.dashboardInterface,
}));

vi.mock("@/lib/database/chart", () => ({
  chartInterface: mocks.chartInterface,
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
  revalidateTag: mocks.revalidateTag,
}));

import { POST } from "../route";

const makeRequest = (body: unknown) =>
  ({
    json: vi.fn().mockResolvedValue(body),
  }) as never;

const validStack = {
  key: "my-stack",
  environment: "PRODUCTION" as const,
  dashboards: [{ key: "dash-1", label: "Dashboard 1" }],
  dataSources: [
    {
      key: "ds-1",
      type: "rest" as const,
      config: { url: "https://api.example.com", method: "get" as const },
    },
  ],
  queries: [
    { key: "q-1", type: "jsonpath" as const, dataSource: "ds-1", jsonPath: "$[*]" },
  ],
  charts: [
    {
      key: "chart-1",
      dashboard: "dash-1",
      query: "q-1",
      label: "Chart 1",
      type: "cartesian" as const,
      config: { categoryField: "id", valueFields: ["value"], orientation: "vertical" as const },
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.mockResolvedValue({ isAuthenticated: true, orgId: "org_123" });
  mocks.mainWorkflow.mockResolvedValue({ stackId: "stack-1" });
  mocks.dashboardInterface.getByStackId.mockResolvedValue([]);
  mocks.chartInterface.getByDashboardId.mockResolvedValue([]);
});

describe("POST /api/dashboard", () => {
  it("rejects partial stack payloads", async () => {
    const response = await POST(
      makeRequest({
        key: "my-stack",
        environment: "PRODUCTION",
      }),
    );

    expect(response.status).toBe(422);
    expect(mocks.mainWorkflow).not.toHaveBeenCalled();
  });

  it("accepts complete stack snapshots", async () => {
    const response = await POST(makeRequest(validStack));

    expect(response.status).toBe(200);
    expect(mocks.mainWorkflow).toHaveBeenCalledWith(validStack, "org_123");
  });
});
