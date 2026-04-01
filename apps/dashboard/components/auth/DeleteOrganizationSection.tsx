import { testAuth } from "@/lib/auth/testAuth";
import organizationInterface from "@/lib/clerk/organization";
import { DeleteOrganizationDialog } from "./DeleteOrganizationDialog";

export async function DeleteOrganizationSection() {
  const { orgId } = await testAuth();
  const org = await organizationInterface.get(orgId);

  return (
    <DeleteOrganizationDialog organizationName={org.name} />
  );
}
