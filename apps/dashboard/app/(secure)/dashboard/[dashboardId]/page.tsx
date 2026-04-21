import CartesianChart from "@/components/widgets/CartesianChart";
import ClockWidget from "@/components/widgets/clockWidget";
import StatCard from "@/components/widgets/statCard";
import WidgetErrorCard from "@/components/widgets/widgetErrorCard";
import ChartGrid from "@/components/chartGrid";
import EnvironmentTabs from "@/components/dashboard/environmentTabs";
import RefreshDashboardButton from "@/components/dashboard/refreshDashboardButton";
import DashboardFilters from "@/components/dashboard/dashboardFilters";
import DashboardSkeleton from "@/components/dashboard/dashboardSkeleton";
import ChartWidget from "@/components/dashboard/chartWidget";
import Container from "@/components/layout/container";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { chartInterface } from "@/lib/database/chart";
import { dashboardInterface } from "@/lib/database/dashboard";
import { filterInterface } from "@/lib/database/filter";
import { getQueryData } from "@/lib/workflows/getQueryData";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { getPageAuth } from "@/lib/auth/getPageAuth";

type DashboardPageProps = {
  params: Promise<{ dashboardId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const ChartSkeleton = () => (
  <Card className="h-full">
    <CardHeader>
      <Skeleton className="h-4 w-32" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-full w-full min-h-24" />
    </CardContent>
  </Card>
);

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

  const widgets = charts.map((chart) => ({
    id: chart.id,
    x: chart.layoutX,
    y: chart.layoutY,
    w: chart.layoutW,
    h: chart.layoutH,
    content: (
      <Suspense key={chart.id} fallback={<ChartSkeleton />}>
        <ChartWidget chartId={chart.id} filterContext={filterContext} />
      </Suspense>
    ),
  }));

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
