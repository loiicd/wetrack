import { JSONPath } from "jsonpath-plus";
import alasql from "alasql";
import { queryInterface } from "../database/query";
import { getChartData } from "./getChartData";
import { validateSql } from "../sql/validateSql";
import { unstable_cache } from "next/cache";

const executeQuery = async (queryId: string): Promise<unknown> => {
  const query = await queryInterface.getById(queryId);

  if (!query) {
    throw new Error("Query not found");
  }

  let sourceData: unknown;
  if (query.dataSourceId) {
    sourceData = await getChartData(query.dataSourceId);
  } else if (query.sourceQueryId) {
    sourceData = await getQueryData(query.sourceQueryId);
  } else {
    throw new Error(
      `Query '${query.key}' hat weder eine DataSource noch eine Source-Query.`,
    );
  }

  if (query.type === "JSONPATH") {
    if (!query.jsonPath) {
      throw new Error(`JSONPath-Query '${query.key}' hat keinen jsonPath.`);
    }
    return JSONPath({ path: query.jsonPath, json: sourceData as object });
  }

  if (query.type === "SQL") {
    if (!query.sql) {
      throw new Error(`SQL-Query '${query.key}' hat kein sql.`);
    }
    validateSql(query.sql);
    const data = Array.isArray(sourceData) ? sourceData : [sourceData];
    return alasql(query.sql, [data]);
  }

  throw new Error(`Unbekannter Query-Typ: ${query.type}`);
};

export const getQueryData = async (queryId: string): Promise<unknown> => {
  const cachedExecute = unstable_cache(
    () => executeQuery(queryId),
    [`query:${queryId}`],
    {
      revalidate: 60,
      tags: [`query:${queryId}`],
    },
  );
  return cachedExecute();
};
