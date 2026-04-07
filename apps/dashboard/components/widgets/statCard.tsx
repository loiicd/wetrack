"use client";

import React from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import type { StatCardConfig } from "@/schemas/dashboard";
import type { DataFrame } from "@/types/dataframe";
import ExpandableWidgetCard from "./expandableWidgetCard";

type StatCardProps = {
  title: string;
  description?: string | null;
  data: DataFrame;
  config: StatCardConfig;
};

const formatValue = (raw: unknown, decimals?: number, unit?: string): string => {
  let formatted: string;
  if (typeof raw === "number") {
    formatted = decimals !== undefined ? raw.toFixed(decimals) : String(raw);
  } else {
    formatted = String(raw ?? "–");
  }
  return unit ? `${formatted} ${unit}` : formatted;
};

const StatCard = ({ title, description, data, config }: StatCardProps) => {
  const { valueField, unit, color, decimals } = config;

  const field = data.fields.find((f) => f.name === valueField);
  const values = (field?.values ?? []) as number[];
  const raw = values[0];
  const displayValue = formatValue(raw, decimals, unit);

  // Trend: show sparkline if multiple data points exist
  const hasTrend = values.length > 1;
  const sparkData = values.map((v, i) => ({ i, v }));

  // Compute change between last and first value
  const change =
    hasTrend && typeof values[0] === "number" && typeof values[values.length - 1] === "number"
      ? values[values.length - 1] - values[0]
      : null;
  const changePercent =
    change !== null && values[0] !== 0
      ? ((change / Math.abs(values[0])) * 100).toFixed(1)
      : null;
  const isPositive = change !== null && change >= 0;

  const accentColor = color ?? "var(--chart-1)";

  return (
    <ExpandableWidgetCard
      title={title}
      description={description}
      widgetQueryKey={`stat-${title}`}
      openOnCardClick
      collapsedContentClassName="flex flex-col justify-between gap-2"
      expandedContentClassName="flex flex-col gap-6"
    >
      {/* Main value */}
      <div className="flex items-end justify-between gap-2">
        <p
          className="text-4xl font-bold tracking-tight tabular-nums leading-none"
          style={{ color: accentColor }}
        >
          {displayValue}
        </p>

        {changePercent !== null && (
          <span
            className={`text-xs font-semibold px-1.5 py-0.5 rounded-full mb-0.5 ${
              isPositive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            }`}
          >
            {isPositive ? "+" : ""}
            {changePercent}%
          </span>
        )}
      </div>

      {/* Sparkline */}
      {hasTrend && (
        <div className="h-14 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`spark-grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={accentColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={accentColor}
                strokeWidth={1.5}
                fill={`url(#spark-grad-${title})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </ExpandableWidgetCard>
  );
};

export default StatCard;
