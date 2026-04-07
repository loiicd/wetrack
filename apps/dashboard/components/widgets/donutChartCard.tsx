"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { DataFrame } from "@/types/dataframe";
import React from "react";
import { Cell, Pie, PieChart } from "recharts";
import ExpandableWidgetCard from "./expandableWidgetCard";

type DonutChartConfig = {
  /** Name des Feldes das die Segment-Bezeichnungen enthält */
  nameField: string;
  /** Name des Feldes das die numerischen Werte enthält */
  valueField: string;
  /** Optionale Farben pro Segment (CSS-Farbe oder CSS-Var) */
  colors?: string[];
  /** Tooltip anzeigen (default: true) */
  showTooltip?: boolean;
  /** Legende anzeigen (default: true) */
  showLegend?: boolean;
};

type DonutChartCardProps = {
  title: string;
  description?: string | null;
  data: DataFrame;
  config: DonutChartConfig;
};

const DEFAULT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const dataFrameToDonutData = (
  df: DataFrame,
  nameField: string,
  valueField: string,
): { name: string; value: number }[] => {
  const nameCol = df.fields.find((f) => f.name === nameField);
  const valueCol = df.fields.find((f) => f.name === valueField);
  if (!nameCol || !valueCol) return [];

  return Array.from({ length: nameCol.values.length }, (_, i) => ({
    name: String(nameCol.values[i]),
    value: Number(valueCol.values[i]),
  }));
};

const DonutChartCard = ({
  title,
  description,
  data,
  config,
}: DonutChartCardProps) => {
  const hasAnimated = React.useRef(false);
  const [isExpanded, setIsExpanded] = React.useState(false);

  const {
    nameField,
    valueField,
    colors,
    showTooltip = true,
    showLegend = true,
  } = config;

  const chartData = dataFrameToDonutData(data, nameField, valueField);

  const chartConfig: ChartConfig = Object.fromEntries(
    chartData.map((entry, i) => [
      entry.name,
      {
        label: entry.name,
        color: colors?.[i] ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
      },
    ]),
  );

  const chartContent = (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <PieChart>
        {showTooltip && (
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
        )}
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius="55%"
          outerRadius="80%"
          strokeWidth={2}
          // eslint-disable-next-line react-hooks/refs
          isAnimationActive={!isExpanded && !hasAnimated.current}
          onAnimationEnd={() => {
            hasAnimated.current = true;
          }}
        >
          {chartData.map((entry, i) => (
            <Cell
              key={`cell-${entry.name}`}
              fill={colors?.[i] ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
              stroke="var(--background)"
            />
          ))}
        </Pie>
        {showLegend && (
          <ChartLegend
            content={<ChartLegendContent nameKey="name" />}
            className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
          />
        )}
      </PieChart>
    </ChartContainer>
  );

  return (
    <ExpandableWidgetCard
      title={title}
      description={description}
      widgetQueryKey={`donut-${title}`}
      onExpandedChange={setIsExpanded}
      openOnCardClick
      collapsedContentClassName="h-48"
      expandedContentClassName="flex-1"
    >
      {chartData.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Keine Daten für dieses Chart.
        </p>
      ) : (
        chartContent
      )}
    </ExpandableWidgetCard>
  );
};

export default DonutChartCard;

