/* eslint-disable @typescript-eslint/no-explicit-any */
import { dataSourceInterface } from "../database/dataSource";
import { credentialInterface } from "../database/credential";
import { filterInterface } from "../database/filter";
import { decryptSecret } from "../vault/encryption";
import { CredentialError } from "../errors/CredentialError";
import { unstable_cache } from "next/cache";
import {
  RestApiConfig,
  RestApiConfigSchema,
} from "@/schemas/configs/restApiConfig";
import { extractFilterValue } from "./getQueryData";
import { stableSerialize } from "@/lib/utils";

const DEFAULT_CACHE_TTL = 60; // seconds

type FilterContext = Record<string, any>;

/** Build an injected config by applying filter values to URL/headers/body */
function applyFilterInjects(
  config: RestApiConfig,
  filters: any[],
  filterContext?: FilterContext,
): RestApiConfig {
  if (!filters.length || !filterContext) return config;

  let url = config.url;
  const extraHeaders: Record<string, string> = {};
  let body = config.body;

  for (const filter of filters) {
    const inject = filter.inject as { location: string; key: string } | undefined;
    if (!inject) continue;

    const value = extractFilterValue(filter, filterContext);
    if (value === undefined || value === null || value === "") continue;

    const strValue = typeof value === "object" ? JSON.stringify(value) : String(value);

    if (inject.location === "query_param") {
      const separator = url.includes("?") ? "&" : "?";
      url = `${url}${separator}${encodeURIComponent(inject.key)}=${encodeURIComponent(strValue)}`;
    } else if (inject.location === "header") {
      extraHeaders[inject.key] = strValue;
    } else if (inject.location === "body") {
      if (body && typeof body === "object" && !Array.isArray(body)) {
        body = { ...(body as Record<string, unknown>), [inject.key]: value };
      } else {
        body = { [inject.key]: value };
      }
    }
  }

  return { ...config, url, headers: { ...config.headers, ...extraHeaders }, body };
}

export const getChartData = async (dataSourceId: string, filterContext?: FilterContext): Promise<unknown> => {
  const dataSource = await dataSourceInterface.getById(dataSourceId);

  if (!dataSource) {
    throw new Error("Data source not found");
  }

  const config = RestApiConfigSchema.parse(dataSource.config);

  // Resolve credential from vault if referenced
  const credentialHeaders: Record<string, string> = {};
  const cacheTags: string[] = [`datasource:${dataSourceId}`];

  if (config.credential) {
    const orgId = dataSource.stack.orgId;
    const credential = await credentialInterface.getByLabel(orgId, config.credential);

    if (!credential) {
      throw new CredentialError(
        `Credential "${config.credential}" not found in vault. Add it under Settings → Credentials.`,
      );
    }

    // Add credential-specific cache tag so updates invalidate this cache
    cacheTags.push(`credential:${orgId}:${config.credential}`);

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
          throw new CredentialError(
            `Credential "${config.credential}" is of type "header" but has no headerName configured.`,
          );
        }
        credentialHeaders[credential.headerName] = value;
        break;
      default:
        throw new CredentialError(`Unknown credential type: "${credential.type}"`);
    }
  }

  // Load filters targeting this dataSource and inject values into the config
  const rawFilters = await filterInterface.getByStackId(dataSource.stackId);
  const normalizedFilters: any[] = rawFilters.map((f: any) => ({ ...(f || {}), ...(f.config || {}) }));
  const injectableFilters = normalizedFilters.filter((f: any) =>
    Array.isArray(f.targets)
      ? f.targets.some((t: any) => t.type === "datasource" && t.key === dataSource.key)
      : false,
  );
  const injectedConfig = applyFilterInjects(config, injectableFilters, filterContext);

  const cachedFetch = unstable_cache(
    () => callRestApi(injectedConfig, credentialHeaders),
    [`datasource:${dataSourceId}`, `filters:${stableSerialize(filterContext)}`],
    {
      revalidate: DEFAULT_CACHE_TTL,
      tags: cacheTags,
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
