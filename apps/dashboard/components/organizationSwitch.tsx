import { membership } from "@/lib/clerk/membership";
import OrganizationSwitchDropdown from "./organizationSwitchDropdown";
import { testAuth } from "@/lib/auth/testAuth";
import organizationInterface from "@/lib/clerk/organization";

const OrganizationSwitch = async () => {
  const { userId, orgId } = await testAuth();

  const activeOrganization = await organizationInterface.get(orgId);

  const activeOrganizationData = {
    id: activeOrganization.id,
    name: activeOrganization.name,
    imageUrl: activeOrganization.imageUrl,
  };

  const memberships = await membership.get(userId);
  const organizations = memberships.map((m) => ({
    id: m.organization.id,
    name: m.organization.name,
    imageUrl: m.organization.imageUrl,
  }));

  return (
    <OrganizationSwitchDropdown
      organizations={organizations}
      activeOrganization={activeOrganizationData}
    />
  );
};

export default OrganizationSwitch;
