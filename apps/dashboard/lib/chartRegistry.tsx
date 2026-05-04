import type { ReactElement } from "react";
import type { ZodType } from "zod";

// ── Types ─────────────────────────────────────────────────────────────────────

/** Minimal shape of a chart DB record needed by the registry. */
export type ChartRecord = {
  id: string;
  type: string;
  label: string;
  description: string | null;
  config: unknown;
  queryId: string | null;
};

export type RenderParams<TConfig> = {
  chart: ChartRecord;
  config: TConfig;
  filterContext?: Record<string, string | undefined>;
};

export type ChartRegistryEntry = {
  /** Zod schema used to validate and parse the raw DB config. */
  configSchema: ZodType;
  /** Renders the chart widget given the parsed config and optional filter context. */
  render: (params: RenderParams<unknown>) => Promise<ReactElement> | ReactElement;
};

// ── Registry ──────────────────────────────────────────────────────────────────

const registry = new Map<string, ChartRegistryEntry>();

/**
 * Register one or more chart type keys against a config schema and render
 * function. The generic `TConfig` is erased after registration so the Map
 * stays homogeneous, while call-sites retain full type safety.
 */
export function registerChartType<TConfig>(
  types: string | string[],
  entry: {
    configSchema: ZodType<TConfig>;
    render: (params: RenderParams<TConfig>) => Promise<ReactElement> | ReactElement;
  },
): void {
  const keys = Array.isArray(types) ? types : [types];
  const erased = entry as unknown as ChartRegistryEntry;
  for (const key of keys) {
    registry.set(key, erased);
  }
}

/** Returns the registry entry for a chart type key, or `undefined` if unknown. */
export function getChartEntry(type: string): ChartRegistryEntry | undefined {
  return registry.get(type);
}

// ── Registrations ─────────────────────────────────────────────────────────────

import CartesianChart from "@/components/widgets/CartesianChart";
import StatCard from "@/components/widgets/statCard";
import ClockWidget from "@/components/widgets/clockWidget";
import {
  cartesianChartConfigSchema,
  statCardConfigSchema,
  clockCardConfigSchema,
} from "@/schemas/dashboard";
import { toDataFrame } from "@/lib/dataframe";
import { getQueryData } from "@/lib/workflows/getQueryData";
import { CARTESIAN_DB_TYPES } from "@/lib/charts/chartTypeMap";
import type { TimeZone } from "@/types/timezone";

registerChartType([...CARTESIAN_DB_TYPES], {
  configSchema: cartesianChartConfigSchema,
  async render({ chart, config, filterContext }) {
    if (!chart.queryId) {
      throw new Error(`Chart '${chart.label}': a queryId is required for type ${chart.type}.`);
    }
    const queryResult = await getQueryData(chart.queryId, filterContext);
    const dataFrame = toDataFrame(queryResult, [
      config.categoryField,
      ...config.valueFields,
    ]);
    const chartConfig = Object.fromEntries(
      config.valueFields.map((vf, i) => [
        vf,
        {
          label: vf,
          color: config.colors?.[i] ?? `var(--chart-${(i % 5) + 1})`,
          type: (config.seriesTypes?.[i] ?? "bar") as
            | "bar"
            | "line"
            | "area"
            | "scatter",
        },
      ]),
    );
    return (
      <CartesianChart
        title={chart.label}
        description={chart.description ?? undefined}
        data={dataFrame}
        config={chartConfig}
      />
    );
  },
});

registerChartType("STAT", {
  configSchema: statCardConfigSchema,
  async render({ chart, config, filterContext }) {
    if (!chart.queryId) {
      throw new Error(`Chart '${chart.label}': a queryId is required for type ${chart.type}.`);
    }
    const queryResult = await getQueryData(chart.queryId, filterContext);
    const dataFrame = toDataFrame(queryResult, [config.valueField]);
    return (
      <StatCard
        title={chart.label}
        description={chart.description}
        data={dataFrame}
        config={config}
      />
    );
  },
});

registerChartType("CLOCK", {
  configSchema: clockCardConfigSchema,
  render({ config }) {
    return (
      <ClockWidget
        timeZone={config.timeZone as TimeZone | undefined}
        label={config.label}
        labelFormat={config.labelFormat}
        showHours={config.showHours}
        showMinutes={config.showMinutes}
        showSeconds={config.showSeconds}
      />
    );
  },
});
