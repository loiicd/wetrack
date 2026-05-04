import { describe, it, expect, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mocks – must be declared before the SUT import so vitest hoists them
// ---------------------------------------------------------------------------

// Stub React components so the test stays in node environment without DOM
vi.mock("@/components/widgets/CartesianChart", () => ({
  default: () => null,
}));
vi.mock("@/components/widgets/statCard", () => ({
  default: () => null,
}));
vi.mock("@/components/widgets/clockWidget", () => ({
  default: () => null,
}));

// Stub out the data-fetching dependency so dispatch tests stay isolated
vi.mock("@/lib/workflows/getQueryData", () => ({
  getQueryData: vi.fn(),
}));

import {
  getChartEntry,
  registerChartType,
} from "../chartRegistry";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("chartRegistry", () => {
  describe("getChartEntry – known types", () => {
    it.each(["CARTESIAN", "BAR", "LINE"])(
      "returns an entry for %s (cartesian family)",
      (type) => {
        expect(getChartEntry(type)).toBeDefined();
      },
    );

    it("returns an entry for STAT", () => {
      expect(getChartEntry("STAT")).toBeDefined();
    });

    it("returns an entry for CLOCK", () => {
      expect(getChartEntry("CLOCK")).toBeDefined();
    });
  });

  describe("getChartEntry – unknown types", () => {
    it("returns undefined for an unregistered chart type", () => {
      expect(getChartEntry("UNKNOWN_TYPE")).toBeUndefined();
    });

    it("returns undefined for an empty string", () => {
      expect(getChartEntry("")).toBeUndefined();
    });
  });

  describe("config schemas – CARTESIAN / BAR / LINE", () => {
    const validConfig = { categoryField: "month", valueFields: ["revenue"] };

    it.each(["CARTESIAN", "BAR", "LINE"])(
      "%s accepts a valid cartesian config",
      (type) => {
        const { configSchema } = getChartEntry(type)!;
        expect(() => configSchema.parse(validConfig)).not.toThrow();
      },
    );

    it("rejects a config missing categoryField", () => {
      const { configSchema } = getChartEntry("CARTESIAN")!;
      expect(() =>
        configSchema.parse({ valueFields: ["revenue"] }),
      ).toThrow();
    });

    it("rejects a config with an empty valueFields array", () => {
      const { configSchema } = getChartEntry("CARTESIAN")!;
      expect(() =>
        configSchema.parse({ categoryField: "month", valueFields: [] }),
      ).toThrow();
    });
  });

  describe("config schemas – STAT", () => {
    it("accepts a valid stat config", () => {
      const { configSchema } = getChartEntry("STAT")!;
      expect(() => configSchema.parse({ valueField: "total" })).not.toThrow();
    });

    it("accepts optional fields (unit, color, decimals)", () => {
      const { configSchema } = getChartEntry("STAT")!;
      expect(() =>
        configSchema.parse({
          valueField: "total",
          unit: "€",
          color: "var(--chart-1)",
          decimals: 2,
        }),
      ).not.toThrow();
    });

    it("rejects a config missing valueField", () => {
      const { configSchema } = getChartEntry("STAT")!;
      expect(() => configSchema.parse({})).toThrow();
    });
  });

  describe("config schemas – CLOCK", () => {
    it("accepts an empty config (all fields are optional)", () => {
      const { configSchema } = getChartEntry("CLOCK")!;
      expect(() => configSchema.parse({})).not.toThrow();
    });

    it("accepts a full clock config", () => {
      const { configSchema } = getChartEntry("CLOCK")!;
      expect(() =>
        configSchema.parse({
          timeZone: "Europe/Berlin",
          label: "Berlin",
          labelFormat: "city",
          showHours: true,
          showMinutes: true,
          showSeconds: false,
        }),
      ).not.toThrow();
    });
  });

  describe("registerChartType", () => {
    it("accepts a single type string", () => {
      registerChartType("TEST_SINGLE", {
        configSchema: { parse: (v: unknown) => v } as never,
        render: () => null as never,
      });
      expect(getChartEntry("TEST_SINGLE")).toBeDefined();
    });

    it("accepts an array of type strings", () => {
      registerChartType(["TEST_A", "TEST_B"], {
        configSchema: { parse: (v: unknown) => v } as never,
        render: () => null as never,
      });
      expect(getChartEntry("TEST_A")).toBeDefined();
      expect(getChartEntry("TEST_B")).toBeDefined();
    });

    it("all types in an array share the same entry object", () => {
      registerChartType(["SHARED_X", "SHARED_Y"], {
        configSchema: { parse: (v: unknown) => v } as never,
        render: () => null as never,
      });
      expect(getChartEntry("SHARED_X")).toBe(getChartEntry("SHARED_Y"));
    });
  });
});
