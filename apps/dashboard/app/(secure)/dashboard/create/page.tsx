import Link from "next/link";
import Container from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Terminal, Code2, Rocket, BookOpen } from "lucide-react";

const STEPS = [
  {
    step: 1,
    title: "SDK installieren",
    description: "Installiere das WeTrack SDK in deinem Projekt.",
    code: "npm install wetrack-dashboard",
    lang: "bash",
  },
  {
    step: 2,
    title: "Stack definieren",
    description: "Definiere dein Dashboard als TypeScript-Code.",
    code: `import { Stack, DataSource, Dashboard } from "wetrack-dashboard";

const ds = new DataSource({
  label: "metrics-api",
  baseUrl: "https://api.example.com",
});

const dashboard = new Dashboard({
  label: "overview",
  title: "Übersicht",
  dataSource: ds,
  charts: [
    {
      label: "requests",
      title: "Requests / min",
      type: "line",
      query: { endpoint: "/metrics/requests" },
    },
  ],
});

export default new Stack({
  label: "production",
  environment: "production",
  dashboards: [dashboard],
});`,
    lang: "typescript",
  },
  {
    step: 3,
    title: "API-Key setzen",
    description: "Hole deinen API-Key unter Einstellungen → API-Keys.",
    code: "export WETRACK_API_KEY=wt_live_xxxxxxxxxxxx",
    lang: "bash",
  },
  {
    step: 4,
    title: "Deployen",
    description: "Deploy deinen Stack mit einem Befehl.",
    code: "npx wetrack-cli deploy mystack.ts",
    lang: "bash",
  },
];

export default function CreateDashboardPage() {
  return (
    <Container>
      <div className="max-w-3xl">
        {/* Back */}
        <Link href="/dashboard" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Übersicht
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-3">Dashboard erstellen</h1>
          <p className="text-muted-foreground text-lg">
            Dashboards werden bei WeTrack als Code definiert und über die CLI
            deployed — kein Drag-and-Drop, kein manuelles Klicken.
          </p>
        </div>

        {/* Concept card */}
        <div className="mb-10 rounded-xl border border-primary/20 bg-primary/5 p-6">
          <div className="flex items-start gap-3">
            <Code2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <h2 className="font-semibold mb-1">Dashboard-as-Code</h2>
              <p className="text-sm text-muted-foreground">
                Du definierst DataSources, Queries und Charts in TypeScript mit
                dem <code className="rounded bg-muted px-1 py-0.5 text-xs">wetrack-dashboard</code> SDK.
                Die CLI übersetzt deinen Stack und deployed ihn in die WeTrack
                Plattform. So sind deine Dashboards versionierbar,
                reproduzierbar und CI/CD-ready.
              </p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-6 mb-10">
          {STEPS.map(({ step, title, description, code, lang }) => (
            <div key={step} className="rounded-xl border bg-background overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b bg-muted/30">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {step}
                </span>
                <div>
                  <h3 className="font-semibold text-sm">{title}</h3>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </div>
              <div className="bg-neutral-950 px-5 py-4">
                <pre className="overflow-x-auto text-xs leading-6 text-neutral-300 font-mono">
                  <code>{code}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Link href="/settings/api-keys">
            <Button className="gap-2">
              <Terminal className="h-4 w-4" />
              API-Key erstellen
            </Button>
          </Link>
          <Link href="https://docs.wetrack.dev" target="_blank">
            <Button variant="outline" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Dokumentation lesen
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" className="gap-2">
              <Rocket className="h-4 w-4" />
              Alle Dashboards
            </Button>
          </Link>
        </div>
      </div>
    </Container>
  );
}
