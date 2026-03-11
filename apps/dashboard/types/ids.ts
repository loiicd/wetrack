type StackId = string & { __brand: "StackId" };
type DashboardId = string & { __brand: "DashboardId" };
type ChartId = string & { __brand: "ChartId" };
type DataSourceId = string & { __brand: "DataSourceId" };
type QueryId = string & { __brand: "QueryId" };
type TransformId = string & { __brand: "TransformId" };

export type {
  StackId,
  DashboardId,
  ChartId,
  DataSourceId,
  QueryId,
  TransformId,
};
