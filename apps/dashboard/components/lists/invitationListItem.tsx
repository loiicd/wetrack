import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/utils";
import InvitationStatusBadge from "../invitationStatusBadge";

type Props = {
  invitation: {
    emailAddress: string;
    role: string;
    status: string;
    createdAt: string | null;
    expiresAt: string | null;
  };
};

const formatRole = (role: string) => {
  return role.replace("org:", "");
};

const InvitationListItem = ({ invitation }: Props) => {
  const initials = getInitials(invitation.emailAddress);

  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="flex items-center gap-2 sm:flex-2/3">
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="text-sm font-medium">
          <p>{invitation.emailAddress}</p>
          <p className="text-xs text-muted-foreground">
            Invited {invitation.createdAt ?? "-"}
            {invitation.expiresAt ? ` • Expires ${invitation.expiresAt}` : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:flex-1/3">
        <div className="text-right text-sm font-medium">
          <p className="capitalize">{formatRole(invitation.role)}</p>
          <InvitationStatusBadge status={invitation.status} />
        </div>
      </div>
    </div>
  );
};

InvitationListItem.Skeleton = function InvitationListItemSkeleton() {
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="flex items-center gap-2 sm:flex-2/3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="text-sm font-medium">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="mt-1 h-3 w-56" />
        </div>
      </div>

      <div className="text-right">
        <Skeleton className="ml-auto h-4 w-20" />
        <Skeleton className="mt-1 ml-auto h-3 w-16" />
      </div>
    </div>
  );
};

export default InvitationListItem;
