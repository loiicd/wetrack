/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { applyFiltersToArray, extractFilterValue, getValueByPath } from "@/lib/filters";

const data = [
  { id: 1, ts: "2026-01-10T00:00:00Z", value: 10, category: "A", name: "apple", nested: { a: { b: 5 } } },
  { id: 2, ts: "2026-01-20T00:00:00Z", value: 20, category: "B", name: "banana" },
  { id: 3, ts: "2026-02-10T00:00:00Z", value: 30, category: "C", name: "cherry" },
];

describe("filter helpers", () => {
  it("getValueByPath returns nested value", () => {
    expect(getValueByPath(data[0], "nested.a.b")).toBe(5);
  });

  it("ignores empty filter values", () => {
    const filters = [{ key: "unused", type: "string", field: "name" }];
    const res = applyFiltersToArray(filters as any, data as any, undefined);
    expect(res.length).toBe(3);
  });

  it("filters by date_range with explicit from/to keys", () => {
    const filters = [{ key: "period", type: "date_range", field: "ts" }];
    const ctx = { period_from: "2026-01-05", period_to: "2026-01-31" };
    const res = applyFiltersToArray(filters as any, data as any, ctx as any);
    expect(res.map((r) => r.id)).toEqual([1, 2]);
  });

  it("filters by date_range using fallback dateFrom/dateTo", () => {
    const filters = [{ key: "period", type: "date_range", field: "ts" }];
    const ctx = { dateFrom: "2026-02-01", dateTo: "2026-02-28" };
    const res = applyFiltersToArray(filters as any, data as any, ctx as any);
    expect(res.map((r) => r.id)).toEqual([3]);
  });

  it("filters by number_range", () => {
    const filters = [{ key: "price", type: "number_range", field: "value" }];
    const ctx = { price_from: "15", price_to: "25" };
    const res = applyFiltersToArray(filters as any, data as any, ctx as any);
    expect(res.map((r) => r.id)).toEqual([2]);
  });

  it("filters by select multiple", () => {
    const filters = [{ key: "cat", type: "select", field: "category" }];
    const ctx = { cat: ["A", "C"] };
    const res = applyFiltersToArray(filters as any, data as any, ctx as any);
    expect(res.map((r) => r.id)).toEqual([1, 3]);
  });

  it("filters by string contains", () => {
    const filters = [{ key: "q", type: "string", field: "name" }];
    const ctx = { q: "an" };
    const res = applyFiltersToArray(filters as any, data as any, ctx as any);
    expect(res.map((r) => r.id)).toEqual([2]);
  });
});
