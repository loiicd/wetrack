import { stackInterface } from "@/lib/database/stack";
import { dataSourceInterface } from "@/lib/database/dataSource";
import { queryInterface } from "@/lib/database/query";
import { transformInterface } from "@/lib/database/transform";
import { Environment, StackId, Status } from "@/types";
import { stackSchema } from "@/schemas/dashboard";
import z from "zod";
import { dashboardInterface } from "../database/dashboard";

type Stack = {
  key: string;
  environment: Environment;
};

type DataSource = {
  key: string;
  type: "rest";
  config: {
    url: string;
    method: "get";
  };
};

type QueryInput = {
  key: string;
  dataSource: string;
  jsonPath: string;
};

type TransformInput = {
  key: string;
  query: string;
  function: "SUM" | "AVG" | "GROUP_BY";
  field: string;
  groupByField?: string;
};

// type Chart = {
//   key: string;
//   label: string;
//   type: "bar";
//   dataSource: string;
// };

export const mainWorkflow = async (data: z.infer<typeof stackSchema>) => {
  const stack = { key: data.key, environment: data.environment };
  const stackId = await createStack(stack);

  await createDashboards(data.dashboards, stackId);

  // await createDataSources(stackId, data.dataSources);

  // const dataSourceMap = await resolveDataSourceMap(stackId);
  // await createQueries(stackId, data.queries, dataSourceMap);

  // const queryMap = await resolveQueryMap(stackId);
  // await createTransforms(stackId, data.transforms, queryMap);
};

const createStack = async (stack: Stack) => {
  return await stackInterface.create({
    key: stack.key,
    environment: stack.environment,
    version: 1,
  });
};

const createDashboards = async (
  dashboards: z.infer<typeof stackSchema>["dashboards"],
  stackId: StackId,
) => {
  await dashboardInterface.createMany(
    dashboards.map((d) => ({
      key: d.key,
      label: d.label,
      description: d.describetion,
      stackId,
    })),
  );
};

// const createDataSources = async (
//   stackId: StackId,
//   dataSources: DataSource[],
// ) => {
//   const dataSourcesToCreate = dataSources.map((dataSource) => ({
//     stackId,
//     key: dataSource.key,
//     type: dataSource.type,
//     config: dataSource.config,
//   }));
//   await dataSourceInterface.createMany(dataSourcesToCreate);
// };

// const resolveDataSourceMap = async (
//   stackId: StackId,
// ): Promise<Record<string, string>> => {
//   const dataSources = await dataSourceInterface.getByStackId(stackId);
//   return Object.fromEntries(dataSources.map((ds) => [ds.key, ds.id]));
// };

// const createQueries = async (
//   stackId: StackId,
//   queries: QueryInput[],
//   dataSourceMap: Record<string, string>,
// ) => {
//   const queriesToCreate = queries.map((query) => ({
//     stackId,
//     key: query.key,
//     dataSourceId: dataSourceMap[query.dataSource]!,
//     jsonPath: query.jsonPath,
//   }));
//   await queryInterface.createMany(queriesToCreate);
// };

// const resolveQueryMap = async (
//   stackId: StackId,
// ): Promise<Record<string, string>> => {
//   const queries = await queryInterface.getByStackId(stackId);
//   return Object.fromEntries(queries.map((q) => [q.key, q.id]));
// };

// const createTransforms = async (
//   stackId: StackId,
//   transforms: TransformInput[],
//   queryMap: Record<string, string>,
// ) => {
//   const transformsToCreate = transforms.map((transform) => ({
//     stackId,
//     key: transform.key,
//     queryId: queryMap[transform.query]!,
//     function: transform.function,
//     field: transform.field,
//     groupByField: transform.groupByField,
//   }));
//   await transformInterface.createMany(transformsToCreate);
// };
