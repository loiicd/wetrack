import { InfisicalSDK } from "@infisical/sdk";

/**
 * Returns true when the required Infisical environment variables are present.
 */
export function isInfisicalConfigured(): boolean {
  return !!(
    process.env.INFISICAL_CLIENT_ID &&
    process.env.INFISICAL_CLIENT_SECRET &&
    process.env.INFISICAL_PROJECT_ID
  );
}

/**
 * Creates and authenticates an InfisicalSDK client via Universal Auth.
 *
 * Required env vars:
 *   INFISICAL_CLIENT_ID     — Machine identity client ID
 *   INFISICAL_CLIENT_SECRET — Machine identity client secret
 *   INFISICAL_PROJECT_ID    — Infisical project ID
 *
 * Optional:
 *   INFISICAL_SITE_URL      — Self-hosted Infisical URL (default: https://app.infisical.com)
 *   INFISICAL_ENVIRONMENT   — Environment slug (default: "prod")
 */
export async function getInfisicalClient(): Promise<InfisicalSDK> {
  const clientId = process.env.INFISICAL_CLIENT_ID;
  const clientSecret = process.env.INFISICAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Infisical is not configured. Set INFISICAL_CLIENT_ID and INFISICAL_CLIENT_SECRET environment variables.",
    );
  }

  const client = new InfisicalSDK({
    siteUrl: process.env.INFISICAL_SITE_URL || undefined,
  });

  await client.auth().universalAuth.login({ clientId, clientSecret });

  return client;
}

/**
 * Returns the configured Infisical project ID.
 */
export function getProjectId(): string {
  const projectId = process.env.INFISICAL_PROJECT_ID;
  if (!projectId) {
    throw new Error("INFISICAL_PROJECT_ID environment variable is not set.");
  }
  return projectId;
}

/**
 * Returns the Infisical environment slug (default: "prod").
 */
export function getEnvironment(): string {
  return process.env.INFISICAL_ENVIRONMENT || "prod";
}

/**
 * Builds a secret path for an organization's credentials.
 * Secrets are stored under /<orgId>/ in Infisical.
 */
export function getSecretPath(orgId: string): string {
  return `/${orgId}`;
}
