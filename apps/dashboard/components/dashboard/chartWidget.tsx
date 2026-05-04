import CartesianChart from "@/components/widgets/CartesianChart";
import ClockWidget from "@/components/widgets/clockWidget";
import StatCard from "@/components/widgets/statCard";
import WidgetErrorCard from "@/components/widgets/widgetErrorCard";
import { chartInterface } from "@/lib/database/chart";
import { toDataFrame } from "@/lib/dataframe";
import { getQueryData } from "@/lib/workflows/getQueryData";
import { CARTESIAN_DB_TYPES } from "@/lib/charts/chartTypeMap";
import {
  cartesianChartConfigSchema,
  clockCardConfigSchema,
  statCardConfigSchema,
} from "@/schemas/dashboard";
import type { TimeZone } from "@/types/timezone";

type Props = {
  chartId: string;
  filterContext?: Record<string, string | undefined>;
};

export default async function ChartWidget({ chartId, filterContext }: Props) {
  "use cache";
  const chart = await chartInterface.getById(chartId);

  if (!chart) {
    return <WidgetErrorCard title="Unknown chart" message="Chart not found." />;
  }

  try {
    if (CARTESIAN_DB_TYPES.has(chart.type)) {
      const config = cartesianChartConfigSchema.parse(chart.config);
      const queryResult = await getQueryData(chart.queryId!, filterContext);
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
    }

    if (chart.type === "STAT") {
      const config = statCardConfigSchema.parse(chart.config);
      const queryResult = await getQueryData(chart.queryId!, filterContext);
      const dataFrame = toDataFrame(queryResult, [config.valueField]);
      return (
        <StatCard
          title={chart.label}
          description={chart.description}
          data={dataFrame}
          config={config}
        />
      );
    }

    if (chart.type === "CLOCK") {
      const config = clockCardConfigSchema.parse(chart.config);
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
    }

    throw new Error(`Chart type '${chart.type}' wird noch nicht unterstützt.`);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unbekannter Fehler beim Laden des Charts.";
    return <WidgetErrorCard title={chart.label} message={message} />;
  }
}
