"use client";

import ChartWrapper from "@/components/chartWrapper";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { LineChartConfig } from "@/schemas/dashboard";
import type { DataFrame } from "@/types/dataframe";
import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

type LineChartCardProps = {
  title: string;
  description?: string | null;
  data: DataFrame;
  config: LineChartConfig;
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
  xField: string,
  valueFields: string[],
): Record<string, unknown>[] => {
  const xCol = df.fields.find((f) => f.name === xField);
  if (!xCol) return [];

  return Array.from({ length: xCol.values.length }, (_, i) => {
    const row: Record<string, unknown> = { [xField]: xCol.values[i] };
    for (const vf of valueFields) {
      const field = df.fields.find((f) => f.name === vf);
      row[vf] = field ? field.values[i] : null;
    }
    return row;
  });
};

const LineChartCard = ({
  title,
  description,
  data,
  config,
}: LineChartCardProps) => {
  const {
    xField,
    valueFields,
    showDots = true,
    filled = false,
    showTooltip = true,
    showLabels = false,
    colors,
    showCard = true,
  } = config;

  const rechartsData = dataFrameToRechartsData(data, xField, valueFields);

  const chartConfig: ChartConfig = Object.fromEntries(
    valueFields.map((vf, i) => [
      vf,
      {
        label: vf,
        color: colors?.[i] ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
      },
    ]),
  );

  return (
    <ChartWrapper
      title={title}
      description={description}
      showCard={showCard}
      contentClassName="min-h-0 flex-1 overflow-hidden pb-2"
    >
      {rechartsData.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Keine Daten für dieses Chart.
        </p>
      ) : (
        <ChartContainer config={chartConfig} className="h-full w-full">
          <LineChart
            accessibilityLayer
            data={rechartsData}
            margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={xField}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} hide={!showLabels} />

            {showTooltip && (
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            )}

            {valueFields.map((vf, i) => {
              const color =
                colors?.[i] ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];
              return (
                <Line
                  key={vf}
                  type="monotone"
                  dataKey={vf}
                  stroke={color}
                  strokeWidth={2}
                  dot={showDots ? { r: 3, fill: color } : false}
                  fill={filled ? color : undefined}
                >
                  {showLabels && (
                    <LabelList
                      dataKey={vf}
                      position="top"
                      className="fill-foreground text-xs"
                    />
                  )}
                </Line>
              );
            })}
          </LineChart>
        </ChartContainer>
      )}
    </ChartWrapper>
  );
};

export default LineChartCard;
