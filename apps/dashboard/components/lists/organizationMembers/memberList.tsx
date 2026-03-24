import { testAuth } from "@/lib/auth/testAuth";
import { membership } from "@/lib/clerk/membership";
import MemberListItem from "./memberListItem";

const MemberList = async () => {
  const { orgId } = await testAuth();
  const memberships = await membership.getByOrganization(orgId);
  const adminCount = memberships.filter((m) => m.role === "org:admin").length;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-semibold text-muted-foreground">
        {memberships.length} members
      </p>

      <ul className="overflow-x-auto">
        {memberships.map((membership) => {
          const isLastAdmin =
            adminCount === 1 && membership.role === "org:admin";
          const user = membership.publicUserData;
          if (!user) return null;

          return (
            <li
              key={membership.id}
              className="w-full min-w-80 shrink-0 border-b py-3 first:pt-0"
            >
              <MemberListItem
                user={{
                  id: user.userId,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  emailAdress: user.identifier,
                  role: membership.role,
                  imageUrl: user.imageUrl,
                }}
                isLastAdmin={isLastAdmin}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
};

MemberList.Skeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-semibold text-muted-foreground">
        Loading members...
      </p>

      <ul className="overflow-x-auto">
        {Array.from({ length: 5 }).map((_, index) => (
          <li
            key={index}
            className="w-full min-w-80 shrink-0 border-b py-3 first:pt-0"
          >
            <MemberListItem.Skeleton />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MemberList;
