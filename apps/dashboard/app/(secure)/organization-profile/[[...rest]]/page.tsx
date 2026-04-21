"use client";

import { OrganizationProfile } from "@clerk/nextjs";
import { KeyRound } from "lucide-react";
import { CredentialsTabPage } from "@/components/credentials/credentialsTabPage";

const OrganizationProfilePage = () => {
  return (
    <div className="flex justify-center p-6">
      <OrganizationProfile routing="path" path="/organization-profile">
        <OrganizationProfile.Page
          label="Credentials"
          url="credentials"
          labelIcon={<KeyRound className="size-4" />}
        >
          <CredentialsTabPage />
        </OrganizationProfile.Page>
      </OrganizationProfile>
    </div>
  );
};

export default OrganizationProfilePage;
