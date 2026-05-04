import WidgetErrorCard from "@/components/widgets/widgetErrorCard";
import { chartInterface } from "@/lib/database/chart";
import { getChartEntry } from "@/lib/chartRegistry";

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

  const entry = getChartEntry(chart.type);
  if (!entry) {
    return (
      <WidgetErrorCard
        title={chart.label}
        message={`Chart type '${chart.type}' is not supported.`}
      />
    );
  }

  try {
    const config = entry.configSchema.parse(chart.config);
    return await entry.render({ chart, config, filterContext });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unbekannter Fehler beim Laden des Charts.";
    return <WidgetErrorCard title={chart.label} message={message} />;
  }
}
