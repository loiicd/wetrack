import Container from "@/components/layout/container";
import { CredentialList } from "@/components/credentials/credentialList";
import { getPageAuth } from "@/lib/auth/getPageAuth";
import { credentialInterface } from "@/lib/database/credential";

const OrganizationProfilePage = async () => {
  const { orgId } = await getPageAuth();
  const credentials = await credentialInterface.getByOrgId(orgId);

  return (
    <Container>
      <div className="space-y-8">
        <h1>Organization Settings</h1>
        <CredentialList initialCredentials={credentials} />
      </div>
    </Container>
  );
};

export default OrganizationProfilePage;
