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

let cachedClient: InfisicalSDK | null = null;

/**
 * Returns a cached, authenticated InfisicalSDK client via Universal Auth.
 * The client is reused across calls to avoid repeated auth round-trips.
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
  if (cachedClient) return cachedClient;

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
  cachedClient = client;

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

/**
 * Ensures the organization folder exists in Infisical.
 * Infisical requires folders to exist before secrets can be created in them.
 * If the folder already exists, the call is a no-op (catches the duplicate error).
 */
export async function ensureOrgFolder(orgId: string): Promise<void> {
  const client = await getInfisicalClient();
  try {
    await client.folders().create({
      name: orgId,
      path: "/",
      projectId: getProjectId(),
      environment: getEnvironment(),
    });
  } catch (e: unknown) {
    // Folder already exists — safe to ignore
    if (isInfisicalNotFoundOrConflict(e)) return;
    throw e;
  }
}

/**
 * Returns true if the error is a "not found" (404) or "conflict/already exists" (409) from Infisical.
 * Used to distinguish missing-folder errors from real failures (network, auth, etc.).
 */
export function isInfisicalNotFoundOrConflict(e: unknown): boolean {
  const message = e instanceof Error ? e.message : String(e);
  return (
    message.includes("already exists") ||
    message.includes("409") ||
    message.includes("404") ||
    message.includes("not found") ||
    message.includes("Folder with path")
  );
}

/**
 * Parsed credential metadata stored in the secret's comment field.
 */
export type CredentialMeta = {
  type: string;
  headerName?: string;
};

/**
 * Parses credential metadata (type, headerName) from a secret's comment field.
 * Falls back to { type: "api-key" } when the comment is empty or malformed.
 */
export function parseCredentialMeta(secretComment?: string): CredentialMeta {
  if (!secretComment) return { type: "api-key" };
  try {
    return JSON.parse(secretComment) as CredentialMeta;
  } catch {
    return { type: "api-key" };
  }
}
