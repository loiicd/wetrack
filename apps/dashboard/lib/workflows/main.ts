import { chartInterface } from "@/lib/database/chart";
import { dataSourceInterface } from "@/lib/database/dataSource";
import { dashboardInterface } from "@/lib/database/dashboard";
import { queryInterface } from "@/lib/database/query";
import { stackInterface } from "@/lib/database/stack";
import { Environment, StackId } from "@/types";
import { stackSchema } from "@/schemas/dashboard";
import { QueryType } from "@/generated/prisma/enums";
import z from "zod";

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

type JSONPathQueryInput = {
  key: string;
  type: "jsonpath";
  dataSource?: string;
  sourceQuery?: string;
  jsonPath: string;
};

type SQLQueryInput = {
  key: string;
  type: "sql";
  dataSource?: string;
  sourceQuery?: string;
  sql: string;
};

type QueryInput = JSONPathQueryInput | SQLQueryInput;

type ChartInput = NonNullable<z.infer<typeof stackSchema>["charts"]>[number];

// type TransformInput = {
//   key: string;
//   query: string;
//   function: "SUM" | "AVG" | "GROUP_BY";
//   field: string;
//   groupByField?: string;
// };

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
  await createDataSources(stackId, data.dataSources);

  const dataSourceMap = await resolveDataSourceMap(stackId);
  await createQueries(stackId, data.queries, dataSourceMap);

  const dashboardMap = await resolveDashboardMap(stackId);
  const queryMap = await resolveQueryMap(stackId);
  await createCharts(stackId, data.charts, dashboardMap, queryMap);

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
  if (!dashboards?.length) {
    return;
  }

  await dashboardInterface.createMany(
    dashboards.map((d) => ({
      key: d.key,
      label: d.label,
      description: d.description,
      stackId,
    })),
  );
};

const createDataSources = async (
  stackId: StackId,
  dataSources: DataSource[] | undefined,
) => {
  if (!dataSources?.length) {
    return;
  }

  const dataSourcesToCreate = dataSources.map((dataSource) => ({
    stackId,
    key: dataSource.key,
    type: dataSource.type,
    config: dataSource.config,
  }));

  await dataSourceInterface.createMany(dataSourcesToCreate);
};

const resolveDataSourceMap = async (
  stackId: StackId,
): Promise<Record<string, string>> => {
  const dataSources = await dataSourceInterface.getByStackId(stackId);
  return Object.fromEntries(dataSources.map((ds) => [ds.key, ds.id]));
};

const resolveDashboardMap = async (
  stackId: StackId,
): Promise<Record<string, string>> => {
  const dashboards = await dashboardInterface.getByStackId(stackId);
  return Object.fromEntries(
    dashboards.map((dashboard) => [dashboard.key, dashboard.id]),
  );
};

const createQueries = async (
  stackId: StackId,
  queries: QueryInput[] | undefined,
  dataSourceMap: Record<string, string>,
) => {
  if (!queries?.length) {
    return;
  }

  // Topologisches Sortieren: Queries mit dataSource zuerst, dann sourceQuery-Abhängigkeiten
  const resolved = new Set<string>();
  const ordered: QueryInput[] = [];

  const resolve = (q: QueryInput) => {
    if (resolved.has(q.key)) return;
    if (q.sourceQuery) {
      const parent = queries.find((p) => p.key === q.sourceQuery);
      if (parent) resolve(parent);
    }
    ordered.push(q);
    resolved.add(q.key);
  };

  for (const q of queries) resolve(q);

  const queriesToCreate = ordered.map((query) => {
    const dataSourceId = query.dataSource
      ? dataSourceMap[query.dataSource]
      : undefined;

    if (query.dataSource && !dataSourceId) {
      throw new Error(
        `DataSource '${query.dataSource}' nicht gefunden für Query '${query.key}'.`,
      );
    }

    if (query.type === "jsonpath") {
      return {
        stackId,
        key: query.key,
        type: QueryType.JSONPATH,
        dataSourceId: dataSourceId ?? null,
        sourceQueryId: null, // wird nach DB-Insert gesetzt
        jsonPath: query.jsonPath,
        sql: null,
      };
    } else {
      return {
        stackId,
        key: query.key,
        type: QueryType.SQL,
        dataSourceId: dataSourceId ?? null,
        sourceQueryId: null,
        jsonPath: null,
        sql: query.sql,
      };
    }
  });

  await queryInterface.createMany(queriesToCreate);

  // sourceQuery-Verknüpfungen nachträglich setzen (nach Erstellung aller Keys)
  const queryMap = await resolveQueryMap(stackId);
  for (const query of ordered) {
    if (query.sourceQuery) {
      const ownId = queryMap[query.key];
      const sourceId = queryMap[query.sourceQuery];
      if (!ownId || !sourceId) {
        throw new Error(
          `sourceQuery '${query.sourceQuery}' nicht gefunden für Query '${query.key}'.`,
        );
      }
      await queryInterface.create({
        stackId,
        key: query.key,
        type: query.type === "jsonpath" ? QueryType.JSONPATH : QueryType.SQL,
        dataSourceId: query.dataSource
          ? (dataSourceMap[query.dataSource] ?? null)
          : null,
        sourceQueryId: sourceId,
        jsonPath: query.type === "jsonpath" ? query.jsonPath : null,
        sql: query.type === "sql" ? query.sql : null,
      });
    }
  }
};

const resolveQueryMap = async (
  stackId: StackId,
): Promise<Record<string, string>> => {
  const queries = await queryInterface.getByStackId(stackId);
  return Object.fromEntries(queries.map((query) => [query.key, query.id]));
};

const createCharts = async (
  stackId: StackId,
  charts: ChartInput[] | undefined,
  dashboardMap: Record<string, string>,
  queryMap: Record<string, string>,
) => {
  if (!charts?.length) {
    return;
  }

  const chartsToCreate = charts.map((chart, index) => {
    const dashboardId = dashboardMap[chart.dashboard];

    if (!dashboardId) {
      throw new Error(
        `Dashboard with key '${chart.dashboard}' not found for chart '${chart.key}'`,
      );
    }

    const queryId = queryMap[chart.query];

    if (!queryId) {
      throw new Error(
        `Query with key '${chart.query}' not found for chart '${chart.key}'`,
      );
    }

    const defaultX = (index % 2) * 6;
    const defaultY = Math.floor(index / 2) * 3;

    return {
      stackId,
      key: chart.key,
      dashboardId,
      queryId,
      type:
        chart.type === "line"
          ? ("LINE" as const)
          : chart.type === "stat"
            ? ("STAT" as const)
            : ("BAR" as const),
      label: chart.label,
      description: chart.description ?? null,
      config: chart.config,
      layoutX: chart.layout?.x ?? defaultX,
      layoutY: chart.layout?.y ?? defaultY,
      layoutW: chart.layout?.w ?? 6,
      layoutH: chart.layout?.h ?? 3,
    };
  });

  await chartInterface.createMany(chartsToCreate);
};

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
