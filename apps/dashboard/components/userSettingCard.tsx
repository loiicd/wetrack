import { OrganizationMembership } from "@clerk/nextjs/server";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import RoleSelect from "./roleSelect";
import UserEditDropdown from "./userEditDropdown";

const UserSettingCard = ({
  membership,
  isLastAdmin = false,
}: {
  membership: OrganizationMembership;
  isLastAdmin?: boolean;
}) => {
  const userData = membership.publicUserData;

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-2 sm:flex-2/3">
        <Avatar>
          <AvatarImage src={userData?.imageUrl} alt="User Avatar" />
          <AvatarFallback>{userData?.firstName?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="text-sm font-medium">
          <p>
            {userData?.firstName} {userData?.lastName}
          </p>
          <p className="text-xs text-muted-foreground">
            {userData?.identifier}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:flex-1/3">
        <RoleSelect
          userId={userData?.userId ?? ""}
          activeRole={membership.role}
          isLastAdmin={isLastAdmin}
        />
        <UserEditDropdown userId={userData?.userId ?? ""} />
      </div>
    </div>
  );
};

export default UserSettingCard;
