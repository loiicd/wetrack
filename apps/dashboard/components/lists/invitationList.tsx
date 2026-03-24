import { testAuth } from "@/lib/auth/testAuth";
import clerkClient from "@/lib/clerk/clerkClient";
import InvitationListItem from "./invitationListItem";

const formatDate = (value: number | null | undefined) => {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const InvitationList = async () => {
  const { orgId } = await testAuth();
  const client = await clerkClient();
  const invitations = await client.organizations.getOrganizationInvitationList({
    organizationId: orgId,
  });

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-semibold text-muted-foreground">
        {invitations.data.length} invitations
      </p>

      <ul className="overflow-x-auto">
        {invitations.data.map((invitation) => (
          <li
            key={invitation.id}
            className="w-full min-w-80 shrink-0 border-b py-3 first:pt-0"
          >
            <InvitationListItem
              invitation={{
                emailAddress: invitation.emailAddress,
                role: invitation.role,
                status: invitation.status ?? "pending",
                createdAt: formatDate(invitation.createdAt),
                expiresAt: formatDate(invitation.expiresAt),
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

InvitationList.Skeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-semibold text-muted-foreground">
        Loading invitations...
      </p>

      <ul className="overflow-x-auto">
        {Array.from({ length: 5 }).map((_, index) => (
          <li
            key={index}
            className="w-full min-w-80 shrink-0 border-b py-3 first:pt-0"
          >
            <InvitationListItem.Skeleton />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InvitationList;
