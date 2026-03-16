import z from "zod";

// ---- DataSource ----

export const dataSourceSchema = z.object({
  key: z.string(),
  type: z.enum(["rest"]),
  config: z.object({
    url: z.string().url(),
    method: z.enum(["get", "post", "put"]),
    headers: z.record(z.string(), z.string()).optional(),
    body: z.unknown().optional(),
  }),
});

// ---- Query ----

const jsonPathQuerySchema = z.object({
  key: z.string(),
  type: z.literal("jsonpath"),
  dataSource: z.string().optional(),
  sourceQuery: z.string().optional(),
  jsonPath: z.string(),
});

const sqlQuerySchema = z.object({
  key: z.string(),
  type: z.literal("sql"),
  dataSource: z.string().optional(),
  sourceQuery: z.string().optional(),
  sql: z.string(),
});

export const querySchema = z.discriminatedUnion("type", [
  jsonPathQuerySchema,
  sqlQuerySchema,
]);

// ---- Dashboard ----

export const dashboardSchema = z.object({
  key: z.string(),
  label: z.string(),
  description: z.string().optional(),
});

// ---- Transform ----

export const transformSchema = z.object({
  key: z.string(),
  query: z.string(),
  function: z.enum(["SUM", "AVG", "GROUP_BY"]),
  field: z.string(),
  groupByField: z.string().optional(),
});

// ---- Charts ----

const chartLayoutSchema = z.object({
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  w: z.number().int().min(1).max(12),
  h: z.number().int().min(1),
});

const barChartConfigSchema = z.object({
  categoryField: z.string(),
  valueFields: z.array(z.string()).min(1),
  orientation: z.enum(["vertical", "horizontal"]).default("vertical"),
  stacked: z.boolean().default(false),
  showLabels: z.boolean().default(false),
  showTooltip: z.boolean().default(true),
  colors: z.array(z.string()).optional(),
});

const lineChartConfigSchema = z.object({
  xField: z.string(),
  valueFields: z.array(z.string()).min(1),
  showDots: z.boolean().default(true),
  filled: z.boolean().default(false),
  showTooltip: z.boolean().default(true),
  showLabels: z.boolean().default(false),
  colors: z.array(z.string()).optional(),
});

const statCardConfigSchema = z.object({
  valueField: z.string(),
  unit: z.string().optional(),
  color: z.string().optional(),
  decimals: z.number().int().min(0).max(10).optional(),
});

const clockCardConfigSchema = z.object({
  /** Zeitzone (IANA), z.B. "Europe/Berlin" – undefined = lokale Zeit */
  timeZone: z.string().optional(),
  /** Überschreibt das automatisch generierte Label */
  label: z.string().optional(),
  /** Format des automatischen Labels */
  labelFormat: z
    .enum(["city", "offset", "abbreviation", "full", "raw"])
    .default("raw"),
  /** Stunden anzeigen */
  showHours: z.boolean().default(true),
  /** Minuten anzeigen */
  showMinutes: z.boolean().default(true),
  /** Sekunden anzeigen */
  showSeconds: z.boolean().default(true),
});

export const chartSchema = z.discriminatedUnion("type", [
  z.object({
    key: z.string(),
    dashboard: z.string(),
    query: z.string(),
    label: z.string(),
    description: z.string().optional(),
    type: z.literal("bar"),
    config: barChartConfigSchema,
    layout: chartLayoutSchema.optional(),
  }),
  z.object({
    key: z.string(),
    dashboard: z.string(),
    query: z.string(),
    label: z.string(),
    description: z.string().optional(),
    type: z.literal("line"),
    config: lineChartConfigSchema,
    layout: chartLayoutSchema.optional(),
  }),
  z.object({
    key: z.string(),
    dashboard: z.string(),
    query: z.string(),
    label: z.string(),
    description: z.string().optional(),
    type: z.literal("stat"),
    config: statCardConfigSchema,
    layout: chartLayoutSchema.optional(),
  }),
  z.object({
    key: z.string(),
    dashboard: z.string(),
    label: z.string(),
    description: z.string().optional(),
    type: z.literal("clock"),
    config: clockCardConfigSchema,
    layout: chartLayoutSchema.optional(),
  }),
]);

// ---- Stack ----

export const stackSchema = z.object({
  key: z.string(),
  environment: z.enum(["PRODUCTION", "STAGING", "DEVELOPMENT"]),
  dashboards: z.array(dashboardSchema).optional(),
  dataSources: z.array(dataSourceSchema).optional(),
  queries: z.array(querySchema).optional(),
  charts: z.array(chartSchema).optional(),
  transforms: z.array(transformSchema).optional(),
});

export type StackSchemaInput = z.input<typeof stackSchema>;
export type StackSchemaOutput = z.output<typeof stackSchema>;
