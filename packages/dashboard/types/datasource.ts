export type RestDataSourceConfig = {
  url: string;
  method: "get" | "post" | "put";
  headers?: Record<string, string>;
  body?: unknown;
};

export type DataSourceConfig = {
  type: "rest";
  config: RestDataSourceConfig;
};

export type DataSourceDefinition = DataSourceConfig & {
  key: string;
};
