import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ApiKeysClient from "./api-keys-client";

const ApiKeysPage = async () => {
  const { orgId } = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!orgId) redirect("/settings/team" as any);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-2xl font-semibold tracking-tight">API Keys</h3>
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
      <ApiKeysClient />
    </div>
  );
};

export default ApiKeysPage;
