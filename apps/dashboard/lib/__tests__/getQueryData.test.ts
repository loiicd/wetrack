import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
vi.mock("@/lib/database/query", () => ({
  queryInterface: { getById: vi.fn() },
}));
vi.mock("@/lib/workflows/getChartData", () => ({
  getChartData: vi.fn(),
}));
vi.mock("@/lib/sql/validateSql", () => ({
  validateSql: vi.fn(),
}));
vi.mock("next/cache", () => ({
  unstable_cache: (fn: () => unknown) => fn,
}));
vi.mock("jsonpath-plus", () => ({
  JSONPath: vi.fn(),
}));
vi.mock("@/lib/vendors/alasql", () => ({
  default: vi.fn(),
}));

import { queryInterface } from "../database/query";
import { getChartData } from "../workflows/getChartData";
import { validateSql } from "../sql/validateSql";
import { getQueryData } from "../workflows/getQueryData";
import { JSONPath } from "jsonpath-plus";
import alasql from "@/lib/vendors/alasql";

beforeEach(() => {
  vi.clearAllMocks();
});

const mockQuery = (overrides: object = {}) => ({
  id: "q1",
  key: "my-query",
  type: "JSONPATH",
  dataSourceId: "ds1",
  sourceQueryId: null,
  jsonPath: "$[*]",
  sql: null,
  ...overrides,
});

describe("getQueryData", () => {
  it("throws when query not found", async () => {
    vi.mocked(queryInterface.getById).mockResolvedValue(null);
    await expect(getQueryData("missing")).rejects.toThrow("Query not found");
  });

  it("throws when query has neither dataSource nor sourceQuery", async () => {
    vi.mocked(queryInterface.getById).mockResolvedValue(
      mockQuery({ dataSourceId: null, sourceQueryId: null }) as never,
    );
    await expect(getQueryData("q1")).rejects.toThrow("weder eine DataSource");
  });

  describe("JSONPATH query", () => {
    it("executes JSONPath against dataSource data", async () => {
      const rawData = [{ id: 1 }, { id: 2 }];
      vi.mocked(queryInterface.getById).mockResolvedValue(mockQuery() as never);
      vi.mocked(getChartData).mockResolvedValue(rawData);
      vi.mocked(JSONPath).mockReturnValue([{ id: 1 }, { id: 2 }]);

      const result = await getQueryData("q1");

      expect(getChartData).toHaveBeenCalledWith("ds1");
      expect(JSONPath).toHaveBeenCalledWith({ path: "$[*]", json: rawData });
      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it("uses sourceQuery data when dataSourceId is null", async () => {
      const q = mockQuery({ dataSourceId: null, sourceQueryId: "q0" });
      vi.mocked(queryInterface.getById)
        .mockResolvedValueOnce(q as never) // for getQueryData("q1")
        .mockResolvedValueOnce(
          mockQuery({ id: "q0", key: "q0", jsonPath: "$" }) as never, // for inner getQueryData("q0")
        );
      vi.mocked(getChartData).mockResolvedValue([1, 2, 3]);
      vi.mocked(JSONPath).mockReturnValue([1, 2, 3]);

      await getQueryData("q1");
      // First getById for q1, then for q0 inside the recursive call
      expect(queryInterface.getById).toHaveBeenCalledWith("q1");
    });

    it("throws when jsonPath is missing on JSONPATH query", async () => {
      vi.mocked(queryInterface.getById).mockResolvedValue(
        mockQuery({ jsonPath: null }) as never,
      );
      vi.mocked(getChartData).mockResolvedValue([]);

      await expect(getQueryData("q1")).rejects.toThrow("hat keinen jsonPath");
    });
  });

  describe("SQL query", () => {
    it("executes SQL against data", async () => {
      const rawData = [{ product: "A", revenue: 100 }];
      vi.mocked(queryInterface.getById).mockResolvedValue(
        mockQuery({ type: "SQL", jsonPath: null, sql: "SELECT * FROM ?" }) as never,
      );
      vi.mocked(getChartData).mockResolvedValue(rawData);
      vi.mocked(alasql).mockReturnValue(rawData);

      const result = await getQueryData("q1");

      expect(validateSql).toHaveBeenCalledWith("SELECT * FROM ?");
      expect(alasql).toHaveBeenCalledWith("SELECT * FROM ?", [rawData]);
      expect(result).toEqual(rawData);
    });

    it("wraps non-array source data in an array for SQL", async () => {
      vi.mocked(queryInterface.getById).mockResolvedValue(
        mockQuery({ type: "SQL", jsonPath: null, sql: "SELECT * FROM ?" }) as never,
      );
      vi.mocked(getChartData).mockResolvedValue({ single: "object" });
      vi.mocked(alasql).mockReturnValue([{ single: "object" }]);

      await getQueryData("q1");

      expect(alasql).toHaveBeenCalledWith("SELECT * FROM ?", [[{ single: "object" }]]);
    });

    it("throws when sql is missing on SQL query", async () => {
      vi.mocked(queryInterface.getById).mockResolvedValue(
        mockQuery({ type: "SQL", jsonPath: null, sql: null }) as never,
      );
      vi.mocked(getChartData).mockResolvedValue([]);

      await expect(getQueryData("q1")).rejects.toThrow("hat kein sql");
    });
  });

  it("throws for unknown query type", async () => {
    vi.mocked(queryInterface.getById).mockResolvedValue(
      mockQuery({ type: "UNKNOWN" }) as never,
    );
    vi.mocked(getChartData).mockResolvedValue([]);

    await expect(getQueryData("q1")).rejects.toThrow("Unbekannter Query-Typ");
  });
});
