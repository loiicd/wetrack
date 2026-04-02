"use client";

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

import BarChartAxes from "./bar/BarChartAxes";
import BarChartBars from "./bar/BarChartBars";
import ChartWrapper from "../chartWrapper";

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
    showCard = true,
  } = config;

  const rechartsLayout =
    orientation === "horizontal" ? "vertical" : "horizontal";

  const rechartsData = dataFrameToRechartsData(
    data,
    categoryField,
    valueFields,
  );

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
    <ChartWrapper title={title} description={description} showCard={showCard}>
      {rechartsData.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Keine Daten für dieses Chart.
        </p>
      ) : (
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart
            accessibilityLayer
            data={rechartsData}
            layout={rechartsLayout}
          >
            <CartesianGrid
              vertical={orientation === "vertical"}
              horizontal={orientation === "horizontal"}
            />
            <BarChartAxes
              orientation={orientation}
              categoryField={categoryField}
              showLabels={showLabels}
            />
            {showTooltip && (
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            )}
            <BarChartBars
              valueFields={valueFields}
              colors={colors}
              stacked={stacked}
              showLabels={showLabels}
              orientation={orientation}
              stackId={stackId}
            />
          </BarChart>
        </ChartContainer>
      )}
    </ChartWrapper>
  );
};

export default BarChartCard;
