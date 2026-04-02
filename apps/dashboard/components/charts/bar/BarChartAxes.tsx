"use client";

import { XAxis, YAxis } from "recharts";

interface BarChartAxesProps {
  orientation: "vertical" | "horizontal";
  categoryField: string;
  showLabels: boolean;
}

const BarChartAxes = ({
  orientation,
  categoryField,
  showLabels,
}: BarChartAxesProps) => {
  return orientation === "horizontal" ? (
    <>
      <YAxis
        type="category"
        dataKey={categoryField}
        tickLine={false}
        axisLine={false}
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
      />
      <YAxis type="number" hide={!showLabels} />
    </>
  );
};

export default BarChartAxes;
