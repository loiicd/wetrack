import z from "zod";

const dashboardSchema = z.object({
  key: z.string(),
  label: z.string(),
  description: z.string().optional(),
});

const dataSourceSchema = z.object({
  key: z.string(),
  type: z.enum(["rest"]),
  config: z.object({
    url: z.string(),
    method: z.enum(["get"]),
  }),
});

export const barChartConfigSchema = z.object({
  categoryField: z.string(),
  valueField: z.string(),
});

export type BarChartConfig = z.infer<typeof barChartConfigSchema>;

const chartLayoutSchema = z.object({
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  w: z.number().int().min(1).max(12),
  h: z.number().int().min(1),
});

const chartSchema = z.object({
  key: z.string(),
  dashboard: z.string(),
  query: z.string(),
  label: z.string(),
  description: z.string().optional(),
  type: z.literal("bar"),
  config: barChartConfigSchema,
  layout: chartLayoutSchema.optional(),
});

const querySchema = z.object({
  key: z.string(),
  dataSource: z.string(),
  jsonPath: z.string(),
});

const transformSchema = z.object({
  key: z.string(),
  query: z.string(),
  function: z.enum(["SUM", "AVG", "GROUP_BY"]),
  field: z.string(),
  groupByField: z.string().optional(),
});

export const stackSchema = z.object({
  key: z.string(),
  environment: z.enum(["PRODUCTION", "STAGING", "DEVELOPMENT"]),
  dataSources: z.array(dataSourceSchema).optional(),
  charts: z.array(chartSchema).optional(),
  dashboards: z.array(dashboardSchema).optional(),
  queries: z.array(querySchema).optional(),
  transforms: z.array(transformSchema).optional(),
});
