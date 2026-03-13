"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { BarChartConfig } from "@/schemas/dashboard";
import type { DataFrame } from "@/types/dataframe";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

type BarChartCardProps = {
  title: string;
  description?: string | null;
  data: DataFrame;
  config: BarChartConfig;
};

const DEFAULT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const dataFrameToRechartsData = (
  df: DataFrame,
  categoryField: string,
  valueFields: string[],
): Record<string, unknown>[] => {
  const catField = df.fields.find((f) => f.name === categoryField);
  if (!catField) return [];

  return Array.from({ length: catField.values.length }, (_, i) => {
    const row: Record<string, unknown> = {
      [categoryField]: catField.values[i],
    };
    for (const vf of valueFields) {
      const field = df.fields.find((f) => f.name === vf);
      row[vf] = field ? field.values[i] : null;
    }
    return row;
  });
};

const BarChartCard = ({
  title,
  description,
  data,
  config,
}: BarChartCardProps) => {
  const {
    categoryField,
    valueFields,
    orientation = "vertical",
    stacked = false,
    showLabels = false,
    showTooltip = true,
    colors,
  } = config;

  const rechartsData = dataFrameToRechartsData(
    data,
    categoryField,
    valueFields,
  );

  // Recharts layout ist invertiert zur visuellen Ausrichtung:
  // orientation "vertical"   → Balken zeigen nach oben   → recharts layout "horizontal"
  // orientation "horizontal" → Balken zeigen nach rechts → recharts layout "vertical"
  const rechartsLayout =
    orientation === "horizontal" ? "vertical" : "horizontal";

  const chartConfig: ChartConfig = Object.fromEntries(
    valueFields.map((vf, i) => [
      vf,
      {
        label: vf,
        color: colors?.[i] ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
      },
    ]),
  );

  const stackId = stacked ? "stack" : undefined;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-hidden pb-2">
        {rechartsData.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Keine Daten für dieses Chart.
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart
              accessibilityLayer
              data={rechartsData}
              layout={rechartsLayout}
              margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
            >
              <CartesianGrid
                vertical={orientation === "vertical"}
                horizontal={orientation === "horizontal"}
              />

              {orientation === "horizontal" ? (
                <>
                  <YAxis
                    type="category"
                    dataKey={categoryField}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    width={100}
                  />
                  <XAxis type="number" hide={!showLabels} />
                </>
              ) : (
                <>
                  <XAxis
                    type="category"
                    dataKey={categoryField}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis type="number" hide={!showLabels} />
                </>
              )}

              {showTooltip && (
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
              )}

              {valueFields.map((vf, i) => (
                <Bar
                  key={vf}
                  dataKey={vf}
                  fill={
                    colors?.[i] ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]
                  }
                  radius={stacked ? 0 : 4}
                  stackId={stackId}
                >
                  {showLabels && (
                    <LabelList
                      dataKey={vf}
                      position={orientation === "horizontal" ? "right" : "top"}
                      className="fill-foreground text-xs"
                    />
                  )}
                </Bar>
              ))}
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default BarChartCard;
