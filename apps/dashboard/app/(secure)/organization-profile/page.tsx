import Container from "@/components/layout/container";
import { CredentialList } from "@/components/credentials/credentialList";
import { getPageAuth } from "@/lib/auth/getPageAuth";
import { isInfisicalConfigured, getInfisicalClient, getProjectId, getEnvironment, getSecretPath } from "@/lib/vault/infisical";

const OrganizationProfilePage = async () => {
  const { orgId } = await getPageAuth();
  const infisicalConfigured = isInfisicalConfigured();

  let credentials: {
    secretKey: string;
    type: string;
    headerName: string | null;
    createdAt: string;
    updatedAt: string;
  }[] = [];

  if (infisicalConfigured) {
    try {
      const client = await getInfisicalClient();
      const response = await client.secrets().listSecrets({
        projectId: getProjectId(),
        environment: getEnvironment(),
        secretPath: getSecretPath(orgId),
      });

      credentials = response.secrets.map((secret) => {
        let meta: { type?: string; headerName?: string } = {};
        try {
          if (secret.secretComment) {
            meta = JSON.parse(secret.secretComment);
          }
        } catch {
          // ignore parse errors
        }
        return {
          secretKey: secret.secretKey,
          type: meta.type ?? "api-key",
          headerName: meta.headerName ?? null,
          createdAt: secret.createdAt,
          updatedAt: secret.updatedAt,
        };
      });
    } catch {
      // If Infisical is unreachable, show empty list
      credentials = [];
    }
  }

  return (
    <Container>
      <div className="space-y-8">
        <h1>Organization Settings</h1>
        <CredentialList
          initialCredentials={credentials}
          infisicalConfigured={infisicalConfigured}
        />
      </div>
    </Container>
  );
};

export default OrganizationProfilePage;
