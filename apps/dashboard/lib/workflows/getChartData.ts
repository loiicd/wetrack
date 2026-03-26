import { dataSourceInterface } from "../database/dataSource";
import { unstable_cache } from "next/cache";
import {
  RestApiConfig,
  RestApiConfigSchema,
} from "@/schemas/configs/restApiConfig";

const DEFAULT_CACHE_TTL = 60; // seconds

export const getChartData = async (dataSourceId: string): Promise<unknown> => {
  const dataSource = await dataSourceInterface.getById(dataSourceId);

  if (!dataSource) {
    throw new Error("Data source not found");
  }

  const config = RestApiConfigSchema.parse(dataSource.config);

  const cachedFetch = unstable_cache(
    () => callRestApi(config),
    [`datasource:${dataSourceId}`],
    {
      revalidate: DEFAULT_CACHE_TTL,
      tags: [`datasource:${dataSourceId}`],
    },
  );

  return await cachedFetch();
};

const callRestApi = async (config: RestApiConfig): Promise<unknown> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000); // 10s timeout

  try {
    const response = await fetch(config.url, {
      method: config.method.toUpperCase(),
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
      signal: controller.signal,
      next: { revalidate: 0 }, // bypass Next.js fetch cache here; handled by unstable_cache above
    });

    if (!response.ok) {
      throw new Error(
        `DataSource request failed: ${response.status} ${response.statusText} (${config.url})`,
      );
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      throw new Error(
        `DataSource returned non-JSON content-type: ${contentType} (${config.url})`,
      );
    }

    const text = await response.text();
    if (text.length > 5_000_000) {
      throw new Error(
        `DataSource response too large (>${5_000_000 / 1_000_000}MB): ${config.url}`,
      );
    }

    return JSON.parse(text);
  } finally {
    clearTimeout(timeout);
  }
};
