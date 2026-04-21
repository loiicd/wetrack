import CartesianChart from "@/components/widgets/CartesianChart";
import ClockWidget from "@/components/widgets/clockWidget";
import StatCard from "@/components/widgets/statCard";
import WidgetErrorCard from "@/components/widgets/widgetErrorCard";
import ChartGrid from "@/components/chartGrid";
import EnvironmentTabs from "@/components/dashboard/environmentTabs";
import RefreshDashboardButton from "@/components/dashboard/refreshDashboardButton";
import DashboardFilters from "@/components/dashboard/dashboardFilters";
import DashboardSkeleton from "@/components/dashboard/dashboardSkeleton";
import Container from "@/components/layout/container";
import { Card, CardContent } from "@/components/ui/card";
import { chartInterface } from "@/lib/database/chart";
import { dashboardInterface } from "@/lib/database/dashboard";
import { filterInterface } from "@/lib/database/filter";
import { toDataFrame } from "@/lib/dataframe";
import { getQueryData } from "@/lib/workflows/getQueryData";
import {
  cartesianChartConfigSchema,
  clockCardConfigSchema,
  statCardConfigSchema,
} from "@/schemas/dashboard";
import type { TimeZone } from "@/types/timezone";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { getPageAuth } from "@/lib/auth/getPageAuth";

type DashboardPageProps = {
  params: Promise<{ dashboardId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const DashboardContent = async ({ props }: { props: DashboardPageProps }) => {
  await connection();
  const { dashboardId } = await props.params;

  const { orgId } = await getPageAuth();
  const dashboard = await dashboardInterface.getById(dashboardId);

  if (!dashboard) {
    return notFound();
  }

  if (orgId && dashboard.stack?.orgId && orgId !== dashboard.stack.orgId) {
    return notFound();
  }

  const [charts, envVariants, rawFilters] = await Promise.all([
    chartInterface.getByDashboardId(dashboardId),
    dashboardInterface.getEnvironmentsByKey(dashboard.key, orgId ?? ""),
    filterInterface.getByStackId(dashboard.stackId),
  ]);

  const filters = rawFilters.map((f) => {
    const cfg = (f.config as Record<string, unknown>) ?? {};
    return {
      key: f.key,
      type: f.type as "select" | "date_range" | "string" | "number_range",
      label: f.label,
      options: Array.isArray(cfg.options) ? (cfg.options as string[]) : undefined,
    };
  });

  const rawSearchParams = props.searchParams ? await props.searchParams : {};
  const filterContext = Object.fromEntries(
    Object.entries(rawSearchParams || {}).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
  ) as Record<string, string | undefined>;


  const widgets = await Promise.all(
    charts.map(async (chart) => {
      try {
        if (
          chart.type === "CARTESIAN" ||
          chart.type === "BAR" ||
          chart.type === "LINE"
        ) {
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
          const queryResult = await getQueryData(chart.queryId!, filterContext);
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-4 justify-between items-center flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">{dashboard.label}</h1>
          {dashboard.description ? (
            <p className="text-sm text-muted-foreground mt-0.5">
              {dashboard.description}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <EnvironmentTabs
            currentId={dashboardId}
            environments={envVariants.map((v) => ({
              id: v.id,
              environment: v.stack!.environment as "PRODUCTION" | "STAGING" | "DEVELOPMENT",
            }))}
          />
          <RefreshDashboardButton dashboardId={dashboardId} />
        </div>
      </div>

      {filters.length > 0 && (
        <DashboardFilters filters={filters} currentValues={filterContext} />
      )}

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
