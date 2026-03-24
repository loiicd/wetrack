import InviteUserDialog from "@/components/inviteUserDialog";
import Container from "@/components/layout/container";
import InvitationList from "@/components/lists/invitationList";
import MemberList from "@/components/lists/organizationMembers/memberList";
import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Page = async () => {
  return (
    <Container>
      <div className="flex flex-col gap-8">
        <div className="flex flex-row justify-between gap-4">
          <h3 className="text-2xl font-semibold tracking-tight">
            Organization Members
          </h3>
          <InviteUserDialog />
        </div>
        <Tabs defaultValue="members" className="">
          <TabsList>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="invitations">Invitations</TabsTrigger>
          </TabsList>
          <TabsContent value="members">
            <Suspense fallback={<MemberList.Skeleton />}>
              <MemberList />
            </Suspense>
          </TabsContent>
          <TabsContent value="invitations">
            <Suspense fallback={<InvitationList.Skeleton />}>
              <InvitationList />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  );
};

export default Page;
