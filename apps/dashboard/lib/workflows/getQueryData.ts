/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSONPath } from "jsonpath-plus";
import alasql from "@/lib/vendors/alasql";
import { queryInterface } from "../database/query";
import { getChartData } from "./getChartData";
import { validateSql } from "../sql/validateSql";
import { unstable_cache } from "next/cache";
import { filterInterface } from "../database/filter";
import { normalizeFilters, applyFiltersToArray } from "../filters";
import { stableSerialize } from "../serialization";

const executeQuery = async (queryId: string, filterContext?: Record<string, any>): Promise<unknown> => {
  const query = await queryInterface.getById(queryId);

  if (!query) {
    throw new Error("Query not found");
  }

  let sourceData: unknown;
  if (query.dataSourceId) {
    sourceData = await getChartData(query.dataSourceId, filterContext);
  } else if (query.sourceQueryId) {
    sourceData = await getQueryData(query.sourceQueryId, filterContext);
  } else {
    throw new Error(
      `Query '${query.key}' hat weder eine DataSource noch eine Source-Query.`,
    );
  }

  // Load filters for this stack and select those that target this query
  const filters = await filterInterface.getByStackId(query.stackId as string);
  const normalizedFilters = normalizeFilters(filters);
  const applicableFilters = normalizedFilters.filter((f: any) =>
    Array.isArray(f.targets)
      ? f.targets.some((t: any) => t.type === "query" && t.key === query.key)
      : false,
  );

  // Apply filters to sourceData when it's an array
  let filteredSource = sourceData;
  if (Array.isArray(sourceData) && applicableFilters.length > 0) {
    filteredSource = applyFiltersToArray(applicableFilters, sourceData, filterContext);
  }

  if (query.type === "JSONPATH") {
    if (!query.jsonPath) {
      throw new Error(`JSONPath-Query '${query.key}' hat keinen jsonPath.`);
    }
    return JSONPath({ path: query.jsonPath, json: filteredSource as object });
  }

  if (query.type === "SQL") {
    if (!query.sql) {
      throw new Error(`SQL-Query '${query.key}' hat kein sql.`);
    }
    validateSql(query.sql);
    const data = Array.isArray(filteredSource) ? filteredSource : [filteredSource];
    return alasql(query.sql, [data]);
  }

  throw new Error(`Unbekannter Query-Typ: ${query.type}`);
};

export const getQueryData = async (queryId: string, filterContext?: Record<string, any>): Promise<unknown> => {
  const cachedExecute = unstable_cache(
    () => executeQuery(queryId, filterContext),
    [`query:${queryId}`, `filters:${stableSerialize(filterContext)}`],
    {
      revalidate: 60,
      tags: [`query:${queryId}`],
    },
  );
  return cachedExecute();
};
