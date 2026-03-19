import { testAuth } from "@/lib/auth/testAuth";
import { membership } from "@/lib/clerk/membership";
import UserSettingCard from "./userSettingCard";

const MemberList = async () => {
  const { orgId } = await testAuth();
  const memberships = await membership.getByOrganization(orgId);
  const adminCount = memberships.filter((m) => m.role === "org:admin").length;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold tracking-tight">
          Workspace Members
        </h3>
      </div>
      <div className="space-y-4">
        <p className="text-xs font-semibold text-muted-foreground">
          {memberships.length} members
        </p>

        <ul className="overflow-x-auto">
          {memberships.map((membership) => {
            const isLastAdmin =
              adminCount === 1 && membership.role === "org:admin";
            return (
              <li
                key={membership.id}
                className="w-full min-w-80 shrink-0 border-b py-3 first:pt-0"
              >
                <UserSettingCard
                  membership={membership}
                  isLastAdmin={isLastAdmin}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default MemberList;
