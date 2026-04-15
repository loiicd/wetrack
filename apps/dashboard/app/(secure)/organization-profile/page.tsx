import Container from "@/components/layout/container";
import { CredentialList } from "@/components/credentials/credentialList";
import { getPageAuth } from "@/lib/auth/getPageAuth";
import { credentialInterface } from "@/lib/database/credential";
import { isVaultConfigured } from "@/lib/vault/encryption";

const OrganizationProfilePage = async () => {
  const { orgId } = await getPageAuth();
  const vaultConfigured = isVaultConfigured();
  const rawCredentials = vaultConfigured
    ? await credentialInterface.getByOrgId(orgId)
    : [];
  const credentials = rawCredentials.map((credential) => ({
    ...credential,
    createdAt: credential.createdAt.toISOString(),
    updatedAt: credential.updatedAt.toISOString(),
  }));

  return (
    <Container>
      <div className="space-y-8">
        <h1>Organization Settings</h1>
        <CredentialList
          initialCredentials={credentials}
          vaultConfigured={vaultConfigured}
        />
      </div>
    </Container>
  );
};

export default OrganizationProfilePage;
