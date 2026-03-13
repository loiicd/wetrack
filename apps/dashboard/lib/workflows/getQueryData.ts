import { JSONPath } from "jsonpath-plus";
import { queryInterface } from "../database/query";
import { getChartData } from "./getChartData";

export const getQueryData = async (queryId: string) => {
  const query = await queryInterface.getById(queryId);

  if (!query) {
    throw new Error("Query not found");
  }

  const sourceData = await getChartData(query.dataSourceId);

  const queryResult = JSONPath({
    path: query.jsonPath,
    json: sourceData,
  });

  console.log("Query result:", queryResult);

  return queryResult;
};
