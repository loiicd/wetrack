import BarChartCard, { BarChartDatum } from "@/components/charts/barChartCard";
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
import { getQueryData } from "@/lib/workflows/getQueryData";
import { BarChartConfig, barChartConfigSchema } from "@/schemas/dashboard";
import { notFound } from "next/navigation";
import { Suspense } from "react";

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const mapQueryResultToBarData = (
  queryResult: unknown,
  config: BarChartConfig,
): BarChartDatum[] => {
  if (!Array.isArray(queryResult)) {
    return [];
  }

  return queryResult.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }

    const categoryValue = item[config.categoryField];
    const numericValue = Number(item[config.valueField]);

    if (categoryValue === undefined || !Number.isFinite(numericValue)) {
      return [];
    }

    return [{ category: String(categoryValue), value: numericValue }];
  });
};

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
        if (chart.type !== "BAR") {
          throw new Error(
            `Chart type '${chart.type}' wird noch nicht unterstützt.`,
          );
        }

        const config = barChartConfigSchema.parse(chart.config);
        const queryResult = await getQueryData(chart.queryId);
        const data = mapQueryResultToBarData(queryResult, config);

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
              data={data}
            />
          ),
        };
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
          content: (
            <Card className="h-full">
              <CardHeader>
                <CardTitle>{chart.label}</CardTitle>
                <CardDescription>
                  Chart konnte nicht geladen werden.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{message}</p>
              </CardContent>
            </Card>
          ),
        };
      }
    }),
  );

  return (
    <div className="flex flex-col gap-4">
      <DashboardBreadcrumb />
      <Card>
        <CardHeader>
          <CardTitle>{dashboard.label}</CardTitle>
          {dashboard.description ? (
            <CardDescription>{dashboard.description}</CardDescription>
          ) : null}
        </CardHeader>
      </Card>

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
