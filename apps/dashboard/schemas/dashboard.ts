import z from "zod";

const dashboardSchema = z.object({
  name: z.string(),
  title: z.string(),
});

const dataSourceSchema = z.object({
  name: z.string(),
  type: z.enum(["rest"]),
  config: z.object({
    url: z.string(),
    method: z.enum(["get"]),
  }),
});

const chartSchema = z.object({
  name: z.string(),
  label: z.string(),
  type: z.enum(["bar"]),
  dataSource: z.string(),
});

export const stackSchema = z.object({
  name: z.string(),
  environment: z.enum(["PRODUCTION", "STAGING"]),
  dataSources: z.array(dataSourceSchema),
  charts: z.array(chartSchema),
  dashboards: z.array(dashboardSchema),
});
