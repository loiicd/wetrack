export type TransformFunction = "sum" | "avg" | "groupBy";

export type TransformConfig = {
  query: string;
  function: TransformFunction;
  field: string;
  groupByField?: string;
};
