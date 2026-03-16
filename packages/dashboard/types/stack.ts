import type { ChartDefinition } from "./chart";
import type { DataSourceDefinition } from "./datasource";
import type { DashboardDefinition } from "./dashboard";
import type { QueryDefinition } from "./query";

export type StackEnvironment = "PRODUCTION" | "STAGING" | "DEVELOPMENT";

export type StackDefinition = {
  key: string;
  environment: StackEnvironment;
  dashboards?: DashboardDefinition[];
  dataSources?: DataSourceDefinition[];
  queries?: QueryDefinition[];
  charts?: ChartDefinition[];
};
