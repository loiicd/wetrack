import { checkFeature } from "@/lib/billing/featureGate";
import { credentialInterface } from "@/lib/database/credential";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CredentialsClient from "./credentials-client";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";
import Link from "next/link";

const CredentialsPage = async () => {
  const { orgId } = await auth();
  if (!orgId) redirect("/settings/team");

  const [credentials, canUseVault] = await Promise.all([
    credentialInterface.getByOrgId(orgId),
    checkFeature("feature:credential_vault"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-2xl font-semibold tracking-tight">Credentials</h3>
          {!canUseVault && (
            <Badge variant="secondary" className="gap-1 text-xs">
              <Lock className="h-3 w-3" />
              Upgrade erforderlich
            </Badge>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Speichere externe API-Keys und Secrets sicher für deine DataSources.
          Werte werden verschlüsselt gespeichert und sind niemals im Klartext sichtbar.
        </p>
      </div>
      {!canUseVault && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-900/40 dark:bg-orange-950/20 p-4 flex items-start gap-3">
          <Lock className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
          <div className="text-sm text-orange-800 dark:text-orange-300">
            <span className="font-medium">Credential Vault nicht verfügbar.</span>{" "}
            Upgrade deinen Plan um verschlüsselte Credentials zu nutzen.{" "}
            <Link href="/settings/billing" className="underline underline-offset-2 font-medium hover:opacity-80">
              Plan upgraden →
            </Link>
          </div>
        </div>
      )}
      <CredentialsClient credentials={credentials} />
    </div>
  );
};

export default CredentialsPage;
