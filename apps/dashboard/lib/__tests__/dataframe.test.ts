import { describe, it, expect } from "vitest";
import { toDataFrame } from "../dataframe";

describe("toDataFrame", () => {
  it("returns empty fields for empty array", () => {
    expect(toDataFrame([])).toEqual({ fields: [] });
  });

  it("returns empty fields for non-array input", () => {
    expect(toDataFrame(null)).toEqual({ fields: [] });
    expect(toDataFrame("string")).toEqual({ fields: [] });
    expect(toDataFrame(42)).toEqual({ fields: [] });
  });

  it("returns empty fields when first item is not an object", () => {
    expect(toDataFrame([1, 2, 3])).toEqual({ fields: [] });
    expect(toDataFrame(["a", "b"])).toEqual({ fields: [] });
  });

  it("infers number type correctly", () => {
    const df = toDataFrame([{ revenue: 100 }, { revenue: 200 }]);
    expect(df.fields[0]).toMatchObject({ name: "revenue", type: "number", values: [100, 200] });
  });

  it("infers boolean type correctly", () => {
    const df = toDataFrame([{ active: true }, { active: false }]);
    expect(df.fields[0]).toMatchObject({ name: "active", type: "boolean", values: [true, false] });
  });

  it("infers string type for plain strings", () => {
    const df = toDataFrame([{ name: "Alice" }, { name: "Bob" }]);
    expect(df.fields[0]).toMatchObject({ name: "name", type: "string", values: ["Alice", "Bob"] });
  });

  it("infers time type for ISO date strings (date only)", () => {
    const df = toDataFrame([{ date: "2024-01-15" }]);
    expect(df.fields[0]).toMatchObject({ name: "date", type: "time" });
  });

  it("infers time type for ISO datetime strings", () => {
    const df = toDataFrame([{ ts: "2024-01-15T12:30:00Z" }]);
    expect(df.fields[0]).toMatchObject({ name: "ts", type: "time" });
  });

  it("uses null for missing keys in rows", () => {
    const df = toDataFrame([{ a: 1, b: 2 }, { a: 3 }]);
    const bField = df.fields.find((f) => f.name === "b");
    expect(bField?.values).toEqual([2, null]);
  });

  it("infers type from first non-null value", () => {
    const df = toDataFrame([{ v: null }, { v: 42 }]);
    expect(df.fields[0]).toMatchObject({ type: "number" });
  });

  it("defaults to string type when all values are null", () => {
    const df = toDataFrame([{ v: null }, { v: null }]);
    expect(df.fields[0]).toMatchObject({ type: "string" });
  });

  it("builds correct multi-field DataFrame", () => {
    const data = [
      { product: "A", revenue: 100, active: true },
      { product: "B", revenue: 200, active: false },
    ];
    const df = toDataFrame(data);
    expect(df.fields).toHaveLength(3);
    expect(df.fields.map((f) => f.name)).toEqual(["product", "revenue", "active"]);
    expect(df.fields[0].values).toEqual(["A", "B"]);
    expect(df.fields[1].values).toEqual([100, 200]);
    expect(df.fields[2].values).toEqual([true, false]);
  });

  it("respects custom fieldNames filter and order", () => {
    const data = [{ a: 1, b: 2, c: 3 }];
    const df = toDataFrame(data, ["c", "a"]);
    expect(df.fields.map((f) => f.name)).toEqual(["c", "a"]);
    expect(df.fields[0].values).toEqual([3]);
    expect(df.fields[1].values).toEqual([1]);
  });

  it("handles rows where some are non-objects gracefully", () => {
    const df = toDataFrame([{ x: 1 }, null as never]);
    expect(df.fields[0].values).toEqual([1, null]);
  });
});
