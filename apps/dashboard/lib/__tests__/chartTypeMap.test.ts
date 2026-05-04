import { describe, it, expect } from "vitest";
import {
  mapSdkChartType,
  mapDbChartType,
  CARTESIAN_DB_TYPES,
} from "@/lib/charts/chartTypeMap";

describe("mapSdkChartType", () => {
  it("maps 'cartesian' to CARTESIAN", () => {
    expect(mapSdkChartType("cartesian")).toBe("CARTESIAN");
  });

  it("maps 'stat' to STAT", () => {
    expect(mapSdkChartType("stat")).toBe("STAT");
  });

  it("maps 'clock' to CLOCK", () => {
    expect(mapSdkChartType("clock")).toBe("CLOCK");
  });

  it("throws loudly for an unknown SDK type", () => {
    expect(() => mapSdkChartType("pie")).toThrow("Unknown chart type 'pie'");
  });

  it("throws for an empty string", () => {
    expect(() => mapSdkChartType("")).toThrow("Unknown chart type ''");
  });
});

describe("mapDbChartType", () => {
  it("maps CARTESIAN to 'cartesian'", () => {
    expect(mapDbChartType("CARTESIAN")).toBe("cartesian");
  });

  it("maps legacy BAR to 'cartesian'", () => {
    expect(mapDbChartType("BAR")).toBe("cartesian");
  });

  it("maps legacy LINE to 'cartesian'", () => {
    expect(mapDbChartType("LINE")).toBe("cartesian");
  });

  it("maps STAT to 'stat'", () => {
    expect(mapDbChartType("STAT")).toBe("stat");
  });

  it("maps CLOCK to 'clock'", () => {
    expect(mapDbChartType("CLOCK")).toBe("clock");
  });
});

describe("CARTESIAN_DB_TYPES", () => {
  it("includes CARTESIAN", () => {
    expect(CARTESIAN_DB_TYPES.has("CARTESIAN")).toBe(true);
  });

  it("includes legacy BAR", () => {
    expect(CARTESIAN_DB_TYPES.has("BAR")).toBe(true);
  });

  it("includes legacy LINE", () => {
    expect(CARTESIAN_DB_TYPES.has("LINE")).toBe(true);
  });

  it("does not include STAT", () => {
    expect(CARTESIAN_DB_TYPES.has("STAT")).toBe(false);
  });

  it("does not include CLOCK", () => {
    expect(CARTESIAN_DB_TYPES.has("CLOCK")).toBe(false);
  });
});
