import { dataSourceInterface } from "../database/dataSource";
import axios from "axios";
import {
  RestApiConfig,
  RestApiConfigSchema,
} from "@/schemas/configs/restApiConfig";

export const getChartData = async (dataSourceId: string) => {
  const dataSource = await dataSourceInterface.getById(dataSourceId);

  if (!dataSource) {
    throw new Error("Data source not found");
  }

  const config = RestApiConfigSchema.parse(dataSource.config);

  return await callRestApi(config);
};

const callRestApi = async (config: RestApiConfig) => {
  const response = await axios.get(config.url, {
    headers: config.headers,
  });

  console.log("API response:", response.data);

  return response.data;
};
