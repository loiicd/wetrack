import CartesianChart from "@/components/widgets/CartesianChart";
import ClockWidget from "@/components/widgets/clockWidget";
import StatCard from "@/components/widgets/statCard";
import WidgetErrorCard from "@/components/widgets/widgetErrorCard";
import ChartGrid from "@/components/chartGrid";
import { Badge } from "@/components/ui/badge";
import RefreshDashboardButton from "@/components/dashboard/refreshDashboardButton";
import DashboardSkeleton from "@/components/dashboard/dashboardSkeleton";
import Container from "@/components/layout/container";
import {
  Card,
  CardContent,
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
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";

type DashboardPageProps = {
  params: Promise<{ dashboardId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const DashboardContent = async ({
  props,
}: {
  props: DashboardPageProps;
}) => {
  await connection();
  const { dashboardId } = await props.params;

  const { orgId } = await auth();
  const dashboard = await dashboardInterface.getById(dashboardId);

  if (!dashboard) {
    return notFound();
  }

  // Ensure user can only access dashboards belonging to their org
  if (orgId && dashboard.stack?.orgId && orgId !== dashboard.stack.orgId) {
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
          const chartConfig = Object.fromEntries(
            config.valueFields.map((vf, i) => [
              vf,
              {
                label: vf,
                color: config.colors?.[i] ?? `var(--chart-${(i % 5) + 1})`,
                type: "bar" as const,
              },
            ]),
          );
          return {
            id: chart.id,
            x: chart.layoutX,
            y: chart.layoutY,
            w: chart.layoutW,
            h: chart.layoutH,
            content: (
              <CartesianChart
                title={chart.label}
                description={chart.description ?? undefined}
                data={dataFrame}
                config={chartConfig}
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
          const chartConfig = Object.fromEntries(
            config.valueFields.map((vf, i) => [
              vf,
              {
                label: vf,
                color: config.colors?.[i] ?? `var(--chart-${(i % 5) + 1})`,
                type: "line" as const,
              },
            ]),
          );
          return {
            id: chart.id,
            x: chart.layoutX,
            y: chart.layoutY,
            w: chart.layoutW,
            h: chart.layoutH,
            content: (
              <CartesianChart
                title={chart.label}
                description={chart.description ?? undefined}
                data={dataFrame}
                config={chartConfig}
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
              <ClockWidget
                timeZone={config.timeZone as TimeZone | undefined}
                label={config.label}
                labelFormat={config.labelFormat}
                showHours={config.showHours}
                showMinutes={config.showMinutes}
                showSeconds={config.showSeconds}
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
          content: <WidgetErrorCard title={chart.label} message={message} />,
        };
      }
    }),
  );

  const env = dashboard.stack?.environment;
  const envBadge = env === "PRODUCTION" ? "default" : env === "STAGING" ? "secondary" : "outline";
  const envLabel = env === "PRODUCTION" ? "Production" : env === "STAGING" ? "Staging" : env === "DEVELOPMENT" ? "Development" : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-4 justify-between items-center">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">{dashboard.label}</h1>
            {envLabel && (
              <Badge variant={envBadge} className="text-xs">
                {envLabel}
              </Badge>
            )}
          </div>
          {dashboard.description ? (
            <p className="text-sm text-muted-foreground mt-0.5">
              {dashboard.description}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <RefreshDashboardButton dashboardId={dashboardId} />
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

const Page = (props: DashboardPageProps) => {
  return (
    <Container>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent props={props} />
      </Suspense>
    </Container>
  );
};

export default Page;
