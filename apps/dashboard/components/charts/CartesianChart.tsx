"use client";

import React from "react";
import {
  Bar,
  ComposedChart,
  CartesianGrid,
  XAxis,
  Line,
  Area,
  Scatter,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import ExpandableWidgetCard from "@/components/widgets/expandableWidgetCard";

type ChartConfig = {
  [key: string]: {
    label?: string;
    color?: string;
    type?: "bar" | "line" | "area" | "scatter";
  };
};

type FieldType = "number" | "string" | "time" | "boolean";

type Field<T = any> = {
  name: string;
  type: FieldType;
  values: T[];
};

export type DataFrame = {
  name?: string;
  fields: Field[];
};

function dataFrameToRows(df: DataFrame): Record<string, any>[] {
  if (!df.fields.length) return [];
  const len = df.fields[0].values.length;
  return Array.from({ length: len }, (_, i) => {
    const row: Record<string, any> = {};
    for (const field of df.fields) {
      row[field.name] = field.values[i];
    }
    return row;
  });
}

function autoChartConfig(data: DataFrame): ChartConfig {
  const numberFields = data.fields.filter((f) => f.type === "number");
  return Object.fromEntries(
    numberFields.map((f, i) => [
      f.name,
      {
        label: f.name,
        color: `var(--chart-${(i % 5) + 1})`,
        type: "bar",
      },
    ]),
  );
}

type GenericChartProps = {
  data: DataFrame;
  config?: ChartConfig;
  title?: string;
  description?: string;
};

function renderSeries(
  valFields: string[],
  autoConfig: ChartConfig,
  isAnimationActive: boolean,
  onAnimationEnd?: () => void,
) {
  return valFields.map((vf, i) => {
    const cfg = autoConfig?.[vf] || {};
    const type = cfg.type || "bar";
    const animationEnd = i === 0 ? onAnimationEnd : undefined;
    if (type === "bar") {
      return (
        <Bar
          key={vf}
          dataKey={vf}
          fill={cfg.color || `var(--chart-${i + 1})`}
          radius={4}
          name={String(cfg.label ?? vf)}
          isAnimationActive={isAnimationActive}
          onAnimationEnd={animationEnd}
        />
      );
    }
    if (type === "line") {
      return (
        <Line
          key={vf}
          dataKey={vf}
          stroke={cfg.color || `var(--chart-${i + 1})`}
          strokeWidth={2}
          dot={true}
          name={String(cfg.label ?? vf)}
          type="monotone"
          isAnimationActive={isAnimationActive}
          onAnimationEnd={animationEnd}
        />
      );
    }
    if (type === "area") {
      return (
        <Area
          key={vf}
          dataKey={vf}
          stroke={cfg.color || `var(--chart-${i + 1})`}
          fill={cfg.color || `var(--chart-${i + 1})`}
          name={String(cfg.label ?? vf)}
          type="monotone"
          isAnimationActive={isAnimationActive}
          onAnimationEnd={animationEnd}
        />
      );
    }
    if (type === "scatter") {
      return (
        <Scatter
          key={vf}
          dataKey={vf}
          fill={cfg.color || `var(--chart-${i + 1})`}
          name={String(cfg.label ?? vf)}
          isAnimationActive={isAnimationActive}
        />
      );
    }
    return null;
  });
}

const CartesianChart = ({
  data,
  config,
  title,
  description,
}: GenericChartProps) => {
  const hasAnimated = React.useRef(false);
  const [isExpanded, setIsExpanded] = React.useState(false);

  const catField = data.fields.find((f) => f.type === "string")?.name || "";
  const valFields = config
    ? Object.keys(config)
    : data.fields.filter((f) => f.type === "number").map((f) => f.name);

  const autoConfig = config || autoChartConfig(data);
  const rows = dataFrameToRows(data);

  const chartContent = (
    <ChartContainer config={autoConfig} className="h-full w-full">
      <ComposedChart accessibilityLayer data={rows}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey={catField}
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dashed" />}
        />
        {renderSeries(
          valFields,
          autoConfig,
          !isExpanded && !hasAnimated.current,
          () => {
            hasAnimated.current = true;
          },
        )}
      </ComposedChart>
    </ChartContainer>
  );

  return (
    <ExpandableWidgetCard
      title={title}
      description={description}
      widgetQueryKey={title ? `chart-${title}` : undefined}
      onExpandedChange={setIsExpanded}
      openOnCardClick
      collapsedContentClassName="h-48"
      expandedContentClassName="flex-1"
    >
      {chartContent}
    </ExpandableWidgetCard>
  );
};

export default CartesianChart;
