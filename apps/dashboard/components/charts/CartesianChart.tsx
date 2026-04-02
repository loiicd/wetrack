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
import { AnimatePresence, motion } from "motion/react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

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
  const [active, setActive] = React.useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const id = React.useId();
  const hasAnimated = React.useRef(false);

  const catField = data.fields.find((f) => f.type === "string")?.name || "";
  const valFields = config
    ? Object.keys(config)
    : data.fields.filter((f) => f.type === "number").map((f) => f.name);

  const autoConfig = config || autoChartConfig(data);
  const rows = dataFrameToRows(data);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(false);
    };
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setActive(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

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
        {renderSeries(valFields, autoConfig, !hasAnimated.current, () => {
          hasAnimated.current = true;
        })}
      </ComposedChart>
    </ChartContainer>
  );

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-10 h-full w-full bg-white/50 backdrop-blur-md dark:bg-black/50"
          />
        )}
      </AnimatePresence>

      {/* Expanded */}
      <AnimatePresence>
        {active && (
          <div className="fixed inset-0 z-100 grid place-items-center sm:mt-16">
            <motion.div
              layoutId={`card-${title}-${id}`}
              ref={cardRef}
              className="relative flex h-full w-full max-w-[calc(100vw-2rem)] flex-col overflow-auto bg-card shadow-sm sm:rounded-t-3xl [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] [scrollbar-width:none]"
            >
              <div className="flex items-start justify-between p-8">
                <div>
                  {description && (
                    <motion.p
                      layoutId={`description-${title}-${id}`}
                      className="text-sm text-muted-foreground"
                    >
                      {description}
                    </motion.p>
                  )}
                  <motion.h3
                    layoutId={`title-${title}-${id}`}
                    className="mt-0.5 text-2xl font-semibold"
                  >
                    {title}
                  </motion.h3>
                </div>
                <motion.button
                  aria-label="Schließen"
                  layoutId={`button-${title}-${id}`}
                  onClick={() => setActive(false)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none"
                >
                  <motion.div
                    animate={{ rotate: active ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="M12 5v14" />
                    </svg>
                  </motion.div>
                </motion.button>
              </div>
              <motion.div
                layoutId={`chart-${title}-${id}`}
                className="flex-1 px-8 pb-10 min-h-0"
              >
                {chartContent}
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Collapsed card */}
      <motion.div
        layoutId={`card-${title}-${id}`}
        onClick={() => setActive(true)}
        className="flex cursor-pointer flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
      >
        <div className="flex items-start justify-between">
          <div>
            {description && (
              <motion.p
                layoutId={`description-${title}-${id}`}
                className="text-sm text-muted-foreground"
              >
                {description}
              </motion.p>
            )}
            <motion.h3
              layoutId={`title-${title}-${id}`}
              className="font-semibold"
            >
              {title}
            </motion.h3>
          </div>
          <motion.button
            aria-label="Öffnen"
            layoutId={`button-${title}-${id}`}
            onClick={(e) => {
              e.stopPropagation();
              setActive(true);
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none"
          >
            <motion.div
              animate={{ rotate: active ? 45 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
            </motion.div>
          </motion.button>
        </div>
        <motion.div layoutId={`chart-${title}-${id}`} className="h-48">
          {chartContent}
        </motion.div>
      </motion.div>
    </>
  );
};

export default CartesianChart;
