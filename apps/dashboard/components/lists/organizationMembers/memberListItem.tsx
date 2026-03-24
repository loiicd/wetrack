import RoleSelect from "@/components/roleSelect";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserEditDropdown from "@/components/userEditDropdown";
import { getInitials } from "@/lib/utils";
import { OrganizationMembership } from "@clerk/nextjs/server";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    emailAdress: string;
    role: OrganizationMembership["role"];
    imageUrl?: string;
  };
  isLastAdmin?: boolean;
};

const MemberListItem = ({ user, isLastAdmin }: Props) => {
  const initials = getInitials(`${user.firstName} ${user.lastName}`);

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-2 sm:flex-2/3">
        <Avatar>
          <AvatarImage src={user.imageUrl} alt="User Avatar" />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="text-sm font-medium">
          <p>
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-muted-foreground">{user.emailAdress}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:flex-1/3">
        <RoleSelect
          userId={user.id}
          activeRole={user.role}
          isLastAdmin={isLastAdmin}
        />
        <UserEditDropdown userId={user.id} />
      </div>
    </div>
  );
};

MemberListItem.Skeleton = () => {
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-2 sm:flex-2/3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="text-sm font-medium">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-1 h-3 w-48" />
        </div>
      </div>
    </div>
  );
};

export default MemberListItem;
