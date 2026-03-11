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

const chartSchema = z.object({
  key: z.string(),
  dataSource: z.string(),
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
