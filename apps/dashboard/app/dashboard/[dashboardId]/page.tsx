import BarChartCard from "@/components/charts/barChartCard";
import ChartErrorCard from "@/components/charts/chartErrorCard";
import ClockCard from "@/components/charts/clockCard";
import LineChartCard from "@/components/charts/lineChartCard";
import StatCard from "@/components/charts/statCard";
import ChartGrid from "@/components/chartGrid";
import DashboardBreadcrumb from "@/components/dashbordBreadcrumb";
import Container from "@/components/layout/container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { chartInterface } from "@/lib/database/chart";
import { dashboardInterface } from "@/lib/database/dashboard";
import { toDataFrame } from "@/lib/dataframe";
import { getQueryData } from "@/lib/workflows/getQueryData";
import {
  barChartConfigSchema,
  clockCardConfigSchema,
  lineChartConfigSchema,
  statCardConfigSchema,
} from "@/schemas/dashboard";
import type { TimeZone } from "@/types/timezone";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { MaximizeIcon } from "lucide-react";

const DashboardContent = async ({
  props,
}: {
  props: PageProps<"/dashboard/[dashboardId]">;
}) => {
  const { dashboardId } = await props.params;

  const dashboard = await dashboardInterface.getById(dashboardId);

  if (!dashboard) {
    return notFound();
  }

  const charts = await chartInterface.getByDashboardId(dashboardId);

  const widgets = await Promise.all(
    charts.map(async (chart) => {
      try {
        if (chart.type === "BAR") {
          const config = barChartConfigSchema.parse(chart.config);
          const queryResult = await getQueryData(chart.queryId!);
          const dataFrame = toDataFrame(queryResult, [
            config.categoryField,
            ...config.valueFields,
          ]);
          return {
            id: chart.id,
            x: chart.layoutX,
            y: chart.layoutY,
            w: chart.layoutW,
            h: chart.layoutH,
            content: (
              <BarChartCard
                title={chart.label}
                description={chart.description}
                data={dataFrame}
                config={config}
              />
            ),
          };
        }

        if (chart.type === "LINE") {
          const config = lineChartConfigSchema.parse(chart.config);
          const queryResult = await getQueryData(chart.queryId!);
          const dataFrame = toDataFrame(queryResult, [
            config.xField,
            ...config.valueFields,
          ]);
          return {
            id: chart.id,
            x: chart.layoutX,
            y: chart.layoutY,
            w: chart.layoutW,
            h: chart.layoutH,
            content: (
              <LineChartCard
                title={chart.label}
                description={chart.description}
                data={dataFrame}
                config={config}
              />
            ),
          };
        }

        if (chart.type === "STAT") {
          const config = statCardConfigSchema.parse(chart.config);
          const queryResult = await getQueryData(chart.queryId!);
          const dataFrame = toDataFrame(queryResult, [config.valueField]);
          return {
            id: chart.id,
            x: chart.layoutX,
            y: chart.layoutY,
            w: chart.layoutW,
            h: chart.layoutH,
            content: (
              <StatCard
                title={chart.label}
                description={chart.description}
                data={dataFrame}
                config={config}
              />
            ),
          };
        }

        if (chart.type === "CLOCK") {
          const config = clockCardConfigSchema.parse(chart.config);
          return {
            id: chart.id,
            x: chart.layoutX,
            y: chart.layoutY,
            w: chart.layoutW,
            h: chart.layoutH,
            content: (
              <ClockCard
                timeZone={config.timeZone as TimeZone | undefined}
                label={config.label}
                labelFormat={config.labelFormat}
                showHours={config.showHours}
                showMinutes={config.showMinutes}
                showSeconds={config.showSeconds}
                showCard={config.showCard}
              />
            ),
          };
        }

        throw new Error(
          `Chart type '${chart.type}' wird noch nicht unterstützt.`,
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unbekannter Fehler beim Laden des Charts.";

        return {
          id: chart.id,
          x: chart.layoutX,
          y: chart.layoutY,
          w: chart.layoutW,
          h: chart.layoutH,
          content: <ChartErrorCard title={chart.label} message={message} />,
        };
      }
    }),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-4 justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{dashboard.label}</h1>
          {dashboard.description ? (
            <p className="text-sm text-muted-foreground">
              {dashboard.description}
            </p>
          ) : null}
        </div>
        <div>
          <Button>Tets</Button>
          <Button variant="ghost" size="icon">
            <MaximizeIcon />
          </Button>
        </div>
      </div>

      {widgets.length > 0 ? (
        <ChartGrid widgets={widgets} />
      ) : (
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">
              Dieses Dashboard enthält noch keine Charts.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const Page = (props: PageProps<"/dashboard/[dashboardId]">) => {
  return (
    <Container>
      <Suspense fallback={<div>Loading dashboard…</div>}>
        <DashboardContent props={props} />
      </Suspense>
    </Container>
  );
};

export default Page;
