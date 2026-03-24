import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SettingsTeamTabs = () => {
  return (
    <Tabs defaultValue="members" className="w-100">
      <TabsList>
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="invitations">Invitations</TabsTrigger>
      </TabsList>
      <TabsContent value="members">
        Make changes to your account here.
      </TabsContent>
      <TabsContent value="invitations">
        Manage your invitations here.
      </TabsContent>
    </Tabs>
  );
};

export default SettingsTeamTabs;
