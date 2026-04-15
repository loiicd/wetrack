import { dataSourceInterface } from "../database/dataSource";
import { getInfisicalClient, getProjectId, getEnvironment, getSecretPath } from "../vault/infisical";
import { CredentialError } from "../errors/CredentialError";
import { unstable_cache } from "next/cache";
import {
  RestApiConfig,
  RestApiConfigSchema,
} from "@/schemas/configs/restApiConfig";

type CredentialMeta = {
  type: string;
  headerName?: string;
};

const DEFAULT_CACHE_TTL = 60; // seconds

export const getChartData = async (dataSourceId: string): Promise<unknown> => {
  const dataSource = await dataSourceInterface.getById(dataSourceId);

  if (!dataSource) {
    throw new Error("Data source not found");
  }

  const config = RestApiConfigSchema.parse(dataSource.config);

  // Resolve credential from Infisical if referenced
  const credentialHeaders: Record<string, string> = {};
  const cacheTags: string[] = [`datasource:${dataSourceId}`];

  if (config.credential) {
    const orgId = dataSource.stack.orgId;

    // Add credential-specific cache tag so updates invalidate this cache
    cacheTags.push(`credential:${orgId}:${config.credential}`);

    let secretValue: string;
    let meta: CredentialMeta;
    try {
      const client = await getInfisicalClient();
      const secret = await client.secrets().getSecret({
        secretName: config.credential,
        projectId: getProjectId(),
        environment: getEnvironment(),
        secretPath: getSecretPath(orgId),
        viewSecretValue: true,
      });
      secretValue = secret.secretValue;
      // Metadata (type, headerName) is stored in the secret comment as JSON
      meta = secret.secretComment
        ? JSON.parse(secret.secretComment)
        : { type: "api-key" };
    } catch (e) {
      if (e instanceof CredentialError) throw e;
      throw new CredentialError(
        `Credential "${config.credential}" not found in vault. Add it under Settings → Credentials.`,
      );
    }

    switch (meta.type) {
      case "bearer":
        credentialHeaders["Authorization"] = `Bearer ${secretValue}`;
        break;
      case "api-key":
        credentialHeaders["X-Api-Key"] = secretValue;
        break;
      case "basic":
        credentialHeaders["Authorization"] = `Basic ${Buffer.from(secretValue).toString("base64")}`;
        break;
      case "header":
        if (!meta.headerName) {
          throw new CredentialError(
            `Credential "${config.credential}" is of type "header" but has no headerName configured.`,
          );
        }
        credentialHeaders[meta.headerName] = secretValue;
        break;
      default:
        throw new CredentialError(`Unknown credential type: "${meta.type}"`);
    }
  }

  const cachedFetch = unstable_cache(
    () => callRestApi(config, credentialHeaders),
    [`datasource:${dataSourceId}`],
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
