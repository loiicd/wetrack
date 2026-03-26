"use client";

import { Button } from "@/components/ui/button";
import OnboardingModal from "@/components/onboarding/onboardingModal";
import { LayoutDashboard, Terminal } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const DashboardsEmptyState = () => {
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col items-center gap-6 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <LayoutDashboard className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">Noch keine Dashboards</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Deploye deinen ersten Stack mit der WeTrack CLI, um Dashboards zu erstellen.
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setOnboardingOpen(true)}>
            <Terminal className="mr-2 h-4 w-4" />
            Quick Start
          </Button>
          <Button
            variant="outline"
            render={<Link href={"/settings/api-keys" as never} />}
          >
            API Key erstellen
          </Button>
        </div>
        <div className="rounded-lg border bg-muted/50 p-4 text-left">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Beispiel Stack deployen:</p>
          <pre className="text-xs">
            <code>{`wetrack deploy mystack.ts \\
  --url ${typeof window !== "undefined" ? window.location.origin : "https://app.wetrack.dev"}/api/dashboard`}</code>
          </pre>
        </div>
      </div>

      <OnboardingModal
        open={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
      />
    </>
  );
};

export default DashboardsEmptyState;
