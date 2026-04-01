import { credentialInterface } from "@/lib/database/credential";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CredentialsClient from "./credentials-client";

const CredentialsPage = async () => {
  const { orgId } = await auth();
  if (!orgId) redirect("/settings/team");

  const credentials = await credentialInterface.getByOrgId(orgId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-2xl font-semibold tracking-tight">Credentials</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Speichere externe API-Keys und Secrets sicher für deine DataSources.
          Werte werden verschlüsselt gespeichert und sind niemals im Klartext sichtbar.
        </p>
      </div>
      <CredentialsClient credentials={credentials} />
    </div>
  );
};

export default CredentialsPage;
