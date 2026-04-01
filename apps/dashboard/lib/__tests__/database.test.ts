import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Prisma mock – vi.hoisted ensures the factory runs before imports
// ---------------------------------------------------------------------------
const prismaMock = vi.hoisted(() => ({
  chart: {
    upsert: vi.fn(),
    findMany: vi.fn(),
    deleteMany: vi.fn(),
  },
  dashboard: {
    upsert: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    deleteMany: vi.fn(),
  },
  dataSource: {
    upsert: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    deleteMany: vi.fn(),
  },
  query: {
    upsert: vi.fn(),
    update: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    deleteMany: vi.fn(),
  },
  stack: {
    upsert: vi.fn(),
    findMany: vi.fn(),
  },
  credential: {
    upsert: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/lib/database/prisma", () => ({ default: prismaMock }));

// ---------------------------------------------------------------------------
// Import SUTs after mock
// ---------------------------------------------------------------------------
import { chartInterface } from "../database/chart";
import { dashboardInterface } from "../database/dashboard";
import { dataSourceInterface } from "../database/dataSource";
import { queryInterface } from "../database/query";
import { stackInterface } from "../database/stack";
import { credentialInterface } from "../database/credential";

beforeEach(() => {
  vi.clearAllMocks();
});

// ===========================================================================
// chartInterface
// ===========================================================================
describe("chartInterface", () => {
  describe("createMany", () => {
    it("upserts each chart", async () => {
      prismaMock.chart.upsert.mockResolvedValue({});
      const charts = [
        { stackId: "s1", key: "chart-1", dashboardId: "d1", queryId: "q1", type: "bar", label: "Bar", config: {} },
        { stackId: "s1", key: "chart-2", dashboardId: "d1", queryId: "q1", type: "line", label: "Line", config: {} },
      ];
      await chartInterface.createMany(charts as never);
      expect(prismaMock.chart.upsert).toHaveBeenCalledTimes(2);
    });

    it("uses defaults for optional layout fields", async () => {
      prismaMock.chart.upsert.mockResolvedValue({});
      await chartInterface.createMany([
        { stackId: "s1", key: "c1", dashboardId: "d1", queryId: null, type: "stat", label: "Stat", config: {} },
      ] as never);
      const call = prismaMock.chart.upsert.mock.calls[0][0];
      expect(call.create.layoutX).toBe(0);
      expect(call.create.layoutY).toBe(0);
      expect(call.create.layoutW).toBe(6);
      expect(call.create.layoutH).toBe(3);
      expect(call.create.version).toBe(1);
    });
  });

  describe("getByDashboardId", () => {
    it("returns charts ordered by layout", async () => {
      const charts = [{ id: "c1" }];
      prismaMock.chart.findMany.mockResolvedValue(charts);
      const result = await chartInterface.getByDashboardId("d1");
      expect(result).toEqual(charts);
      expect(prismaMock.chart.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { dashboardId: "d1" } }),
      );
    });
  });

  describe("deleteNotInKeys", () => {
    it("deletes charts not in provided key list", async () => {
      prismaMock.chart.deleteMany.mockResolvedValue({ count: 2 });
      await chartInterface.deleteNotInKeys("s1", ["c1", "c2"]);
      expect(prismaMock.chart.deleteMany).toHaveBeenCalledWith({
        where: { stackId: "s1", key: { notIn: ["c1", "c2"] } },
      });
    });
  });
});

// ===========================================================================
// dashboardInterface
// ===========================================================================
describe("dashboardInterface", () => {
  const dashboardData = { key: "dash-1", label: "My Dashboard", description: "desc", stackId: "s1" };

  describe("create", () => {
    it("upserts a dashboard and returns the record", async () => {
      prismaMock.dashboard.upsert.mockResolvedValue({ id: "d1", ...dashboardData });
      const result = await dashboardInterface.create(dashboardData);
      expect(result).toMatchObject({ id: "d1" });
    });
  });

  describe("createMany", () => {
    it("upserts all dashboards", async () => {
      prismaMock.dashboard.upsert.mockResolvedValue({});
      await dashboardInterface.createMany([dashboardData, { ...dashboardData, key: "dash-2" }]);
      expect(prismaMock.dashboard.upsert).toHaveBeenCalledTimes(2);
    });

    it("defaults description to null when omitted", async () => {
      prismaMock.dashboard.upsert.mockResolvedValue({});
      await dashboardInterface.createMany([{ key: "d", label: "L", stackId: "s1" }]);
      const call = prismaMock.dashboard.upsert.mock.calls[0][0];
      expect(call.create.description).toBeNull();
    });
  });

  describe("getById", () => {
    it("returns the dashboard with stack info", async () => {
      prismaMock.dashboard.findUnique.mockResolvedValue({ id: "d1" });
      const result = await dashboardInterface.getById("d1");
      expect(result).toEqual({ id: "d1" });
    });

    it("returns null when not found", async () => {
      prismaMock.dashboard.findUnique.mockResolvedValue(null);
      const result = await dashboardInterface.getById("missing");
      expect(result).toBeNull();
    });
  });

  describe("getByStackId", () => {
    it("returns all dashboards for a stack", async () => {
      prismaMock.dashboard.findMany.mockResolvedValue([{ id: "d1" }]);
      const result = await dashboardInterface.getByStackId("s1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getMany", () => {
    it("returns all dashboards when no orgId given", async () => {
      prismaMock.dashboard.findMany.mockResolvedValue([]);
      await dashboardInterface.getMany();
      const call = prismaMock.dashboard.findMany.mock.calls[0][0];
      expect(call.where).toBeUndefined();
    });

    it("filters by orgId when provided", async () => {
      prismaMock.dashboard.findMany.mockResolvedValue([]);
      await dashboardInterface.getMany("org1");
      const call = prismaMock.dashboard.findMany.mock.calls[0][0];
      expect(call.where).toEqual({ stack: { orgId: "org1" } });
    });
  });

  describe("getByStackKey", () => {
    it("deduplicates by dashboard key (first wins)", async () => {
      prismaMock.dashboard.findMany.mockResolvedValue([
        { key: "dash-a", id: "d1" },
        { key: "dash-a", id: "d2" }, // duplicate key → should be dropped
        { key: "dash-b", id: "d3" },
      ]);
      const result = await dashboardInterface.getByStackKey("my-stack");
      expect(result).toHaveLength(2);
      expect(result.map((d) => d.id)).toEqual(["d1", "d3"]);
    });
  });

  describe("deleteNotInKeys", () => {
    it("deletes dashboards not in provided key list", async () => {
      prismaMock.dashboard.deleteMany.mockResolvedValue({ count: 1 });
      await dashboardInterface.deleteNotInKeys("s1", ["dash-1"]);
      expect(prismaMock.dashboard.deleteMany).toHaveBeenCalledWith({
        where: { stackId: "s1", key: { notIn: ["dash-1"] } },
      });
    });
  });
});

// ===========================================================================
// dataSourceInterface
// ===========================================================================
describe("dataSourceInterface", () => {
  const dsData = { key: "ds-1", type: "rest", config: { url: "https://x.com", method: "get" }, stackId: "s1" };

  describe("create", () => {
    it("upserts and returns the data source", async () => {
      prismaMock.dataSource.upsert.mockResolvedValue({ id: "ds1" });
      const result = await dataSourceInterface.create(dsData as never);
      expect(result).toEqual({ id: "ds1" });
    });
  });

  describe("createMany", () => {
    it("upserts all data sources", async () => {
      prismaMock.dataSource.upsert.mockResolvedValue({});
      await dataSourceInterface.createMany([dsData, { ...dsData, key: "ds-2" }] as never);
      expect(prismaMock.dataSource.upsert).toHaveBeenCalledTimes(2);
    });

    it("wraps upsert errors with the key name", async () => {
      prismaMock.dataSource.upsert.mockRejectedValue(new Error("DB error"));
      await expect(dataSourceInterface.createMany([dsData] as never)).rejects.toThrow(
        "Failed to upsert dataSource 'ds-1'",
      );
    });
  });

  describe("getById", () => {
    it("returns the data source when found", async () => {
      prismaMock.dataSource.findUnique.mockResolvedValue({ id: "ds1" });
      const result = await dataSourceInterface.getById("ds1");
      expect(result).toEqual({ id: "ds1" });
    });

    it("returns null when not found", async () => {
      prismaMock.dataSource.findUnique.mockResolvedValue(null);
      expect(await dataSourceInterface.getById("x")).toBeNull();
    });
  });

  describe("getByLatestStackKey", () => {
    it("returns the first result", async () => {
      prismaMock.dataSource.findFirst.mockResolvedValue({ id: "ds1" });
      const result = await dataSourceInterface.getByLatestStackKey("my-stack");
      expect(result).toEqual({ id: "ds1" });
    });
  });

  describe("getByStackId", () => {
    it("returns data sources for a stack", async () => {
      prismaMock.dataSource.findMany.mockResolvedValue([{ id: "ds1" }]);
      const result = await dataSourceInterface.getByStackId("s1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getMany", () => {
    it("filters by orgId when provided", async () => {
      prismaMock.dataSource.findMany.mockResolvedValue([]);
      await dataSourceInterface.getMany("org1");
      const call = prismaMock.dataSource.findMany.mock.calls[0][0];
      expect(call.where).toEqual({ stack: { orgId: "org1" } });
    });

    it("omits filter when no orgId given", async () => {
      prismaMock.dataSource.findMany.mockResolvedValue([]);
      await dataSourceInterface.getMany();
      const call = prismaMock.dataSource.findMany.mock.calls[0][0];
      expect(call.where).toBeUndefined();
    });
  });

  describe("deleteNotInKeys", () => {
    it("deletes data sources not in key list", async () => {
      prismaMock.dataSource.deleteMany.mockResolvedValue({ count: 0 });
      await dataSourceInterface.deleteNotInKeys("s1", ["ds-1"]);
      expect(prismaMock.dataSource.deleteMany).toHaveBeenCalledWith({
        where: { stackId: "s1", key: { notIn: ["ds-1"] } },
      });
    });
  });
});

// ===========================================================================
// queryInterface
// ===========================================================================
describe("queryInterface", () => {
  const qData = { stackId: "s1", key: "q-1", type: "JSONPATH" as const, jsonPath: "$[*]" };

  describe("create", () => {
    it("upserts and returns the query", async () => {
      prismaMock.query.upsert.mockResolvedValue({ id: "q1" });
      const result = await queryInterface.create(qData as never);
      expect(result).toEqual({ id: "q1" });
    });
  });

  describe("createMany", () => {
    it("upserts all queries sequentially", async () => {
      prismaMock.query.upsert.mockResolvedValue({});
      await queryInterface.createMany([qData, { ...qData, key: "q-2" }] as never);
      expect(prismaMock.query.upsert).toHaveBeenCalledTimes(2);
    });

    it("throws with key name on upsert error", async () => {
      prismaMock.query.upsert.mockRejectedValue(new Error("Constraint"));
      await expect(queryInterface.createMany([qData] as never)).rejects.toThrow(
        "Failed to upsert query 'q-1'",
      );
    });
  });

  describe("updateSourceQueryId", () => {
    it("updates the sourceQueryId field", async () => {
      prismaMock.query.update.mockResolvedValue({ id: "q1", sourceQueryId: "q-src" });
      await queryInterface.updateSourceQueryId("q1", "q-src");
      expect(prismaMock.query.update).toHaveBeenCalledWith({
        where: { id: "q1" },
        data: { sourceQueryId: "q-src" },
      });
    });
  });

  describe("getById", () => {
    it("returns the query when found", async () => {
      prismaMock.query.findUnique.mockResolvedValue({ id: "q1" });
      expect(await queryInterface.getById("q1")).toEqual({ id: "q1" });
    });

    it("returns null when not found", async () => {
      prismaMock.query.findUnique.mockResolvedValue(null);
      expect(await queryInterface.getById("missing")).toBeNull();
    });
  });

  describe("getByStackId", () => {
    it("returns queries for a stack", async () => {
      prismaMock.query.findMany.mockResolvedValue([{ id: "q1" }]);
      const result = await queryInterface.getByStackId("s1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getMany", () => {
    it("filters by orgId", async () => {
      prismaMock.query.findMany.mockResolvedValue([]);
      await queryInterface.getMany("org1");
      const call = prismaMock.query.findMany.mock.calls[0][0];
      expect(call.where).toEqual({ stack: { orgId: "org1" } });
    });
  });

  describe("deleteNotInKeys", () => {
    it("deletes queries not in key list", async () => {
      prismaMock.query.deleteMany.mockResolvedValue({ count: 1 });
      await queryInterface.deleteNotInKeys("s1", ["q-1"]);
      expect(prismaMock.query.deleteMany).toHaveBeenCalledWith({
        where: { stackId: "s1", key: { notIn: ["q-1"] } },
      });
    });
  });
});

// ===========================================================================
// stackInterface
// ===========================================================================
describe("stackInterface", () => {
  describe("create", () => {
    it("upserts and returns the stack id", async () => {
      prismaMock.stack.upsert.mockResolvedValue({ id: "stack-1" });
      const id = await stackInterface.create({
        key: "my-stack",
        environment: "PRODUCTION",
        orgId: "org1",
      } as never);
      expect(id).toBe("stack-1");
    });
  });

  describe("getMany", () => {
    it("returns all stacks when no orgId", async () => {
      prismaMock.stack.findMany.mockResolvedValue([]);
      await stackInterface.getMany();
      const call = prismaMock.stack.findMany.mock.calls[0][0];
      expect(call.where).toBeUndefined();
    });

    it("filters by orgId when provided", async () => {
      prismaMock.stack.findMany.mockResolvedValue([{ id: "s1" }]);
      const result = await stackInterface.getMany("org1");
      const call = prismaMock.stack.findMany.mock.calls[0][0];
      expect(call.where).toEqual({ orgId: "org1" });
      expect(result).toHaveLength(1);
    });
  });
});

// ===========================================================================
// credentialInterface
// ===========================================================================
describe("credentialInterface", () => {
  const cred = { orgId: "org1", label: "my-api", type: "bearer", encryptedValue: "enc123" };

  describe("create", () => {
    it("upserts and returns the credential", async () => {
      prismaMock.credential.upsert.mockResolvedValue({ id: "c1" });
      const result = await credentialInterface.create(cred);
      expect(result).toEqual({ id: "c1" });
    });

    it("defaults headerName to null when not provided", async () => {
      prismaMock.credential.upsert.mockResolvedValue({});
      await credentialInterface.create(cred);
      const call = prismaMock.credential.upsert.mock.calls[0][0];
      expect(call.update.headerName).toBeNull();
    });
  });

  describe("getByOrgId", () => {
    it("returns credentials without encryptedValue", async () => {
      prismaMock.credential.findMany.mockResolvedValue([{ id: "c1", label: "my-api" }]);
      const result = await credentialInterface.getByOrgId("org1");
      expect(result[0]).not.toHaveProperty("encryptedValue");
    });
  });

  describe("getByLabel", () => {
    it("returns matching credential", async () => {
      prismaMock.credential.findUnique.mockResolvedValue({ id: "c1", ...cred });
      const result = await credentialInterface.getByLabel("org1", "my-api");
      expect(result?.label).toBe("my-api");
    });

    it("returns null when not found", async () => {
      prismaMock.credential.findUnique.mockResolvedValue(null);
      expect(await credentialInterface.getByLabel("org1", "missing")).toBeNull();
    });
  });

  describe("deleteByLabel", () => {
    it("deletes the credential", async () => {
      prismaMock.credential.delete.mockResolvedValue({ id: "c1" });
      await credentialInterface.deleteByLabel("org1", "my-api");
      expect(prismaMock.credential.delete).toHaveBeenCalledWith({
        where: { orgId_label: { orgId: "org1", label: "my-api" } },
      });
    });
  });
});
