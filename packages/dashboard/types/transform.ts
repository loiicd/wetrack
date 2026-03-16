export type TransformFunction = "SUM" | "AVG" | "GROUP_BY";

export type TransformConfig = {
  query: string;
  function: TransformFunction;
  field: string;
  groupByField?: string;
};

export type TransformDefinition = TransformConfig & {
  key: string;
};
