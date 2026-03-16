import type { DataSourceKey, QueryKey } from "./keys";

export type JSONPathQueryConfig = {
  type: "jsonpath";
  dataSource?: DataSourceKey;
  sourceQuery?: QueryKey;
  jsonPath: string;
};

export type SQLQueryConfig = {
  type: "sql";
  dataSource?: DataSourceKey;
  sourceQuery?: QueryKey;
  sql: string;
};

export type QueryConfig = JSONPathQueryConfig | SQLQueryConfig;

export type QueryDefinition = QueryConfig & {
  key: string;
};
