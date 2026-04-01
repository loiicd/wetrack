import { checkFeature } from "@/lib/billing/featureGate";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ApiKeysClient from "./api-keys-client";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";
import Link from "next/link";

const ApiKeysPage = async () => {
  const { orgId } = await auth();
  if (!orgId) redirect("/settings/team");

  const canDeploy = await checkFeature("feature:deploy");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-2xl font-semibold tracking-tight">API Keys</h3>
          {!canDeploy && (
            <Badge variant="secondary" className="gap-1 text-xs">
              <Lock className="h-3 w-3" />
              Upgrade erforderlich
            </Badge>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Erstelle API Keys für die WeTrack CLI. Verwende{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            wetrack deploy --api-key &lt;key&gt;
          </code>{" "}
          oder setze{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            WETRACK_API_KEY
          </code>{" "}
          als Umgebungsvariable.
        </p>
      </div>
      {!canDeploy && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-900/40 dark:bg-orange-950/20 p-4 flex items-start gap-3">
          <Lock className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
          <div className="text-sm text-orange-800 dark:text-orange-300">
            <span className="font-medium">Deploy-Feature nicht verfügbar.</span>{" "}
            API Keys können erstellt werden, aber Deployments werden abgelehnt bis du deinen Plan upgradest.{" "}
            <Link href="/settings/billing" className="underline underline-offset-2 font-medium hover:opacity-80">
              Plan upgraden →
            </Link>
          </div>
        </div>
      )}
      <ApiKeysClient />
    </div>
  );
};

export default ApiKeysPage;
