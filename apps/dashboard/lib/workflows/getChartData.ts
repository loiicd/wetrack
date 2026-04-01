import { dataSourceInterface } from "../database/dataSource";
import { credentialInterface } from "../database/credential";
import { decryptSecret } from "../vault/encryption";
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

  // Resolve credential from vault if referenced
  const credentialHeaders: Record<string, string> = {};
  if (config.credential) {
    const orgId = dataSource.stack.orgId;
    const credential = await credentialInterface.getByLabel(orgId, config.credential);

    if (!credential) {
      throw new Error(
        `Credential "${config.credential}" not found in vault. Add it under Settings → Credentials.`,
      );
    }

    const value = await decryptSecret(credential.encryptedValue);

    switch (credential.type) {
      case "bearer":
        credentialHeaders["Authorization"] = `Bearer ${value}`;
        break;
      case "api-key":
        credentialHeaders["X-Api-Key"] = value;
        break;
      case "basic":
        credentialHeaders["Authorization"] = `Basic ${Buffer.from(value).toString("base64")}`;
        break;
      case "header":
        if (!credential.headerName) {
          throw new Error(
            `Credential "${config.credential}" is of type "header" but has no headerName configured.`,
          );
        }
        credentialHeaders[credential.headerName] = value;
        break;
      default:
        throw new Error(`Unknown credential type: "${credential.type}"`);
    }
  }

  const cachedFetch = unstable_cache(
    () => callRestApi(config, credentialHeaders),
    [`datasource:${dataSourceId}`],
    {
      revalidate: DEFAULT_CACHE_TTL,
      tags: [`datasource:${dataSourceId}`],
    },
  );

  return await cachedFetch();
};

const callRestApi = async (
  config: RestApiConfig,
  credentialHeaders: Record<string, string>,
): Promise<unknown> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000); // 10s timeout

  try {
    const response = await fetch(config.url, {
      method: config.method.toUpperCase(),
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
        ...credentialHeaders, // credential headers override everything
      },
      body:
        config.method !== "get" && config.body !== undefined
          ? JSON.stringify(config.body)
          : undefined,
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
