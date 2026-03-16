export type JSONPathQueryConfig = {
  type: "jsonpath";
  dataSource?: string;
  sourceQuery?: string;
  jsonPath: string;
};

export type SQLQueryConfig = {
  type: "sql";
  dataSource?: string;
  sourceQuery?: string;
  sql: string;
};

export type QueryConfig = JSONPathQueryConfig | SQLQueryConfig;

export type QueryDefinition = QueryConfig & {
  key: string;
};
