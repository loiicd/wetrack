import { JSONPath } from "jsonpath-plus";
import alasql from "alasql";
import { queryInterface } from "../database/query";
import { getChartData } from "./getChartData";
import { validateSql } from "../sql/validateSql";

export const getQueryData = async (queryId: string): Promise<unknown> => {
  const query = await queryInterface.getById(queryId);

  if (!query) {
    throw new Error("Query not found");
  }

  // Quelldaten laden – entweder von DataSource oder von einer anderen Query
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
    const result = JSONPath({ path: query.jsonPath, json: sourceData });
    console.log("JSONPath-Query Ergebnis:", result);
    return result;
  }

  if (query.type === "SQL") {
    if (!query.sql) {
      throw new Error(`SQL-Query '${query.key}' hat kein sql.`);
    }
    validateSql(query.sql);
    const data = Array.isArray(sourceData) ? sourceData : [sourceData];
    const result = alasql(query.sql, [data]);
    console.log("SQL-Query Ergebnis:", result);
    return result;
  }

  throw new Error(`Unbekannter Query-Typ: ${query.type}`);
};
