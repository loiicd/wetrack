"use client";

import { Bar, LabelList } from "recharts";

const DEFAULT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

interface BarChartBarsProps {
  valueFields: string[];
  colors?: string[];
  stacked: boolean;
  showLabels: boolean;
  orientation: "vertical" | "horizontal";
  stackId?: string;
}

const BarChartBars = ({
  valueFields,
  colors,
  stacked,
  showLabels,
  orientation,
  stackId,
}: BarChartBarsProps) => {
  return (
    <>
      {valueFields.map((vf, i) => (
        <Bar
          key={vf}
          dataKey={vf}
          fill={colors?.[i] ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
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
    </>
  );
};

export default BarChartBars;
