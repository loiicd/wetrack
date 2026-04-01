import { chartInterface } from "@/lib/database/chart";
import { dataSourceInterface } from "@/lib/database/dataSource";
import { dashboardInterface } from "@/lib/database/dashboard";
import { queryInterface } from "@/lib/database/query";
import { stackInterface } from "@/lib/database/stack";
import { Environment, StackId } from "@/types";
import { stackSchema } from "@/schemas/dashboard";
import { QueryType } from "@/generated/prisma/enums";
import { Prisma } from "@/generated/prisma/client";
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
    method: "get" | "post" | "put";
    headers?: Record<string, string>;
    body?: unknown;
    credential?: string;
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

export const mainWorkflow = async (
  data: z.infer<typeof stackSchema>,
  orgId: string,
) => {
  const stack = { key: data.key, environment: data.environment };
  const stackId = await createStack(stack, orgId);

  await createDashboards(data.dashboards, stackId);
  await createDataSources(stackId, data.dataSources);

  const dataSourceMap = await resolveDataSourceMap(stackId);
  await createQueries(stackId, data.queries, dataSourceMap);

  const dashboardMap = await resolveDashboardMap(stackId);
  const queryMap = await resolveQueryMap(stackId);
  await createCharts(stackId, data.charts, dashboardMap, queryMap);

  // Gelöschte Einträge entfernen (Reihenfolge: Charts → Queries → DataSources → Dashboards)
  const chartKeys = (data.charts ?? []).map((c) => c.key);
  await chartInterface.deleteNotInKeys(stackId, chartKeys);

  const queryKeys = (data.queries ?? []).map((q) => q.key);
  await queryInterface.deleteNotInKeys(stackId, queryKeys);

  const dataSourceKeys = (data.dataSources ?? []).map((ds) => ds.key);
  await dataSourceInterface.deleteNotInKeys(stackId, dataSourceKeys);

  const dashboardKeys = (data.dashboards ?? []).map((d) => d.key);
  await dashboardInterface.deleteNotInKeys(stackId, dashboardKeys);
};

const createStack = async (stack: Stack, orgId: string) => {
  return await stackInterface.create({
    key: stack.key,
    environment: stack.environment,
    orgId,
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
    config: dataSource.config as Prisma.InputJsonValue,
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

  // sourceQuery-Verknüpfungen nachträglich via Update setzen (kein zweiter Create)
  const queryMap = await resolveQueryMap(stackId);
  const sourceQueryUpdates = ordered.filter((q) => q.sourceQuery);
  if (sourceQueryUpdates.length > 0) {
    await Promise.all(
      sourceQueryUpdates.map((query) => {
        const ownId = queryMap[query.key];
        const sourceId = queryMap[query.sourceQuery!];
        if (!ownId || !sourceId) {
          throw new Error(
            `sourceQuery '${query.sourceQuery}' nicht gefunden für Query '${query.key}'.`,
          );
        }
        return queryInterface.updateSourceQueryId(ownId, sourceId);
      }),
    );
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

    const queryId: string | null =
      chart.type === "clock"
        ? null
        : (() => {
            const id = queryMap[(chart as { query: string }).query];
            if (!id) {
              throw new Error(
                `Query with key '${
                  (chart as { query: string }).query
                }' not found for chart '${chart.key}'`,
              );
            }
            return id;
          })();

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
            : chart.type === "clock"
              ? ("CLOCK" as const)
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
