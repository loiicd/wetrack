export type DataFrameFieldType = "number" | "string" | "time" | "boolean";

export type DataFrameField = {
  name: string;
  type: DataFrameFieldType;
  values: unknown[];
};

export type DataFrame = {
  fields: DataFrameField[];
};
