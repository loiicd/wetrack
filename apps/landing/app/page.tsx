import {
  Braces,
  Cable,
  ChevronRight,
  CloudUpload,
  Database,
  GitBranch,
  Layers,
  LockKeyhole,
  Radar,
  Sparkles,
} from "lucide-react";

import { FeatureCard } from "@/components/feature-card";
import { SectionHeading } from "@/components/section-heading";

const CODE_SAMPLE = `import { Stack, Dashboard, DataSource, Query, Chart } from "dashboard_as_code";

const api = new DataSource("finance-api", {
  type: "rest",
  config: { url: "https://api.example.com/v1/kpis", method: "get" },
});

const dash = new Dashboard("revenue", { label: "Revenue Control" });

const monthly = new Query("monthly", {
  type: "sql",
  dataSource: api.key,
  sql: "SELECT month, mrr, churn FROM ? ORDER BY month ASC",
});

export default new Stack("saas-stack", "PRODUCTION")
  .addDashboard(dash)
  .addDataSource(api)
  .addQuery(monthly)
  .addChart(new Chart("mrr", {
    dashboard: dash.key,
    source: monthly,
    type: "line",
    label: "MRR Evolution",
    config: { xField: "month", valueFields: ["mrr", "churn"] },
    layout: { x: 0, y: 0, w: 12, h: 3 },
  }));`;

const FEATURES = [
  {
    icon: <Braces className="size-5" />,
    title: "TypeScript-first Modeling",
    description:
      "Dashboards, Queries und DataSources sind echter Code. Keine klickbare Konfiguration, die außerhalb deiner Reviews lebt.",
  },
  {
    icon: <Database className="size-5" />,
    title: "REST + Query Pipeline",
    description:
      "Nutze JSONPath oder SQL, um rohe API-Daten in saubere, visualisierbare Datenmodelle zu transformieren.",
  },
  {
    icon: <LockKeyhole className="size-5" />,
    title: "Credentials ohne Chaos",
    description:
      "API-Keys werden im Vault gehalten. Im Stack referenzierst du nur Labels statt geheimen Strings.",
  },
  {
    icon: <GitBranch className="size-5" />,
    title: "Git-native Collaboration",
    description:
      "Pull Requests, Branch Previews und Rollbacks funktionieren genauso wie bei deinem Produktcode.",
  },
  {
    icon: <Layers className="size-5" />,
    title: "Composable Building Blocks",
    description:
      "Queries können auf Queries aufbauen. So entstehen wiederverwendbare Daten-Layer statt Copy-Paste-Charts.",
  },
  {
    icon: <Radar className="size-5" />,
    title: "Operational Visibility",
    description:
      "Von Revenue bis Incident-Metrics: alles in einem konsistenten, deploybaren Stack pro Team und Environment.",
  },
];

const WORKFLOW_STEPS = [
  {
    title: "Model",
    text: "Definiere Stack, Dashboards und Data Pipelines in TypeScript.",
    command: "wetrack synth stack.ts",
  },
  {
    title: "Validate",
    text: "Previewe das synthetisierte JSON lokal und prüfe den Output im PR.",
    command: "wetrack deploy stack.ts --dry-run",
  },
  {
    title: "Ship",
    text: "Deploye mit einem Befehl in deine Umgebung, versioniert und reproduzierbar.",
    command: "wetrack deploy stack.ts",
  },
];

const PRICING = [
  {
    name: "Free",
    price: "€0",
    cadence: "für immer",
    items: [
      "1 Organization",
      "5 Dashboards",
      "Unbegrenzte Queries",
      "Community Support",
    ],
  },
  {
    name: "Pro",
    price: "€39",
    cadence: "pro Monat",
    items: [
      "Unbegrenzte Dashboards",
      "Credential Vault",
      "Teams & Rollen",
      "CI/CD Integrationen",
    ],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "",
    items: [
      "Self-hosted Option",
      "Audit & SSO",
      "Dedizierter Support",
      "Custom Onboarding",
    ],
  },
];

const FAQ = [
  {
    q: "Brauche ich dafür ein eigenes Frontend-Team?",
    a: "Nein. WeTrack ist für Produkt- und Plattformteams gebaut, die bestehende TypeScript-Kompetenz nutzen wollen.",
  },
  {
    q: "Kann ich bestehende REST-APIs direkt anbinden?",
    a: "Ja. DataSources nutzen HTTP-Requests; danach kannst du die Daten per JSONPath oder SQL transformieren.",
  },
  {
    q: "Wie funktioniert Multi-Environment?",
    a: "Stacks definieren ein Environment wie DEVELOPMENT, STAGING oder PRODUCTION und werden gezielt dorthin deployed.",
  },
];

export default function Home() {
  return (
    <main id="top" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_20%,oklch(0.79_0.11_34/.25),transparent_42%),radial-gradient(circle_at_80%_12%,oklch(0.72_0.18_280/.18),transparent_38%),radial-gradient(circle_at_50%_84%,oklch(0.58_0.14_200/.18),transparent_35%)]" />

      <section className="container grid gap-12 py-18 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-26">
        <div className="space-y-8">
          <p className="text-muted-foreground text-xs font-semibold tracking-[0.22em] uppercase">
            Open Beta • Dashboard Infrastructure
          </p>
          <h1 className="font-display text-4xl leading-[1.03] font-semibold md:text-6xl lg:text-7xl">
            Dashboards, die sich wie Software
            <span className="text-gradient block">
              entwickeln und deployen lassen.
            </span>
          </h1>
          <p className="text-muted-foreground max-w-xl text-lg leading-relaxed md:text-xl">
            WeTrack macht Reporting zu einer echten Engineering-Disziplin:
            modellierbar, reviewbar und reproduzierbar per CLI.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://app.wetrack.dev/signUp"
              className="inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm font-semibold text-background transition-transform hover:scale-[1.02]"
            >
              Start free
              <ChevronRight className="ml-1 size-4" />
            </a>
            <a
              href="https://docs.wetrack.dev"
              className="inline-flex h-11 items-center rounded-full border border-border/80 bg-background/65 px-6 text-sm font-medium backdrop-blur transition-colors hover:bg-background"
            >
              Documentation
            </a>
          </div>
          <div className="flex flex-wrap gap-5 text-sm">
            <p className="inline-flex items-center gap-2 text-muted-foreground">
              <Sparkles className="size-4 text-chart-2" />
              TypeScript SDK
            </p>
            <p className="inline-flex items-center gap-2 text-muted-foreground">
              <CloudUpload className="size-4 text-chart-3" />
              One-command Deploy
            </p>
            <p className="inline-flex items-center gap-2 text-muted-foreground">
              <Cable className="size-4 text-chart-1" />
              REST-native
            </p>
          </div>
        </div>

        <div className="border-border/70 bg-card/85 overflow-hidden rounded-3xl border shadow-2xl shadow-black/10 backdrop-blur-sm">
          <div className="border-border/70 flex items-center gap-2 border-b px-5 py-3">
            <span className="size-2.5 rounded-full bg-rose-400" />
            <span className="size-2.5 rounded-full bg-amber-400" />
            <span className="size-2.5 rounded-full bg-emerald-400" />
            <span className="text-muted-foreground ml-3 font-mono text-xs">
              stack.ts
            </span>
          </div>
          <pre className="max-h-115 overflow-auto p-5 font-mono text-xs leading-6">
            <code>{CODE_SAMPLE}</code>
          </pre>
        </div>
      </section>

      <section className="container pb-14 lg:pb-20">
        <div className="grid gap-3 rounded-2xl border border-border/60 bg-background/60 p-3 backdrop-blur md:grid-cols-3">
          <div className="rounded-xl border border-border/60 bg-card/70 p-5">
            <p className="font-display text-3xl font-semibold">3x</p>
            <p className="text-muted-foreground text-sm">
              Schneller von API zu Dashboard-Release
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-card/70 p-5">
            <p className="font-display text-3xl font-semibold">100%</p>
            <p className="text-muted-foreground text-sm">
              Versionierbar in Git mit Review-Flow
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-card/70 p-5">
            <p className="font-display text-3xl font-semibold">0</p>
            <p className="text-muted-foreground text-sm">
              Abhängigkeit von Drag-and-Drop Buildern
            </p>
          </div>
        </div>
      </section>

      <section id="features" className="container section-padding">
        <SectionHeading
          eyebrow="Capabilities"
          title="Bausteine für echte Dashboard-Engineering-Workflows"
          description="Jede Section im Stack erfüllt eine klare Aufgabe: Daten holen, modellieren, visualisieren und zuverlässig ausrollen."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      <section
        id="workflow"
        className="section-padding border-y border-border/60 bg-card/35"
      >
        <div className="container">
          <SectionHeading
            eyebrow="Workflow"
            title="Von Idee bis Deployment in drei sauberen Schritten"
            description="Reduziere Reporting-Chaos auf einen reproduzierbaren Prozess, den jedes Team verstehen kann."
            align="center"
          />
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {WORKFLOW_STEPS.map((step, index) => (
              <article
                key={step.title}
                className="relative rounded-2xl border border-border/60 bg-background/80 p-6"
              >
                <span className="text-muted-foreground font-mono text-xs">
                  0{index + 1}
                </span>
                <h3 className="font-display mt-2 text-2xl font-semibold">
                  {step.title}
                </h3>
                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                  {step.text}
                </p>
                <div className="mt-5 rounded-xl border border-border/70 bg-muted/30 px-4 py-3 font-mono text-xs">
                  {step.command}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="container section-padding">
        <SectionHeading
          eyebrow="Pricing"
          title="Skaliert mit Team und Reifegrad"
          description="Starte kostenlos, nimm Pro für produktive Teams und skaliere mit Enterprise-Governance."
          align="center"
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {PRICING.map((plan) => (
            <article
              key={plan.name}
              className={
                plan.featured
                  ? "relative rounded-2xl border border-chart-2/60 bg-[linear-gradient(160deg,oklch(0.96_0.02_320),oklch(0.93_0.03_285))] p-7 shadow-xl"
                  : "rounded-2xl border border-border/60 bg-card/65 p-7"
              }
            >
              {plan.featured ? (
                <span className="absolute -top-3 left-6 rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background">
                  Most popular
                </span>
              ) : null}
              <h3 className="font-display text-2xl font-semibold">
                {plan.name}
              </h3>
              <p className="mt-3 text-4xl font-semibold">{plan.price}</p>
              {plan.cadence ? (
                <p className="text-muted-foreground text-sm">{plan.cadence}</p>
              ) : null}
              <ul className="mt-6 space-y-2 text-sm">
                {plan.items.map((item) => (
                  <li
                    key={item}
                    className="text-muted-foreground inline-flex items-start gap-2"
                  >
                    <span className="mt-1 size-1.5 rounded-full bg-chart-2" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="https://app.wetrack.dev/signUp"
                className={
                  plan.featured
                    ? "mt-8 inline-flex h-10 w-full items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background"
                    : "mt-8 inline-flex h-10 w-full items-center justify-center rounded-full border border-border text-sm font-semibold"
                }
              >
                {plan.name === "Enterprise" ? "Contact Sales" : "Choose plan"}
              </a>
            </article>
          ))}
        </div>
      </section>

      <section
        id="faq"
        className="section-padding border-y border-border/60 bg-card/35"
      >
        <div className="container grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <SectionHeading
            eyebrow="FAQ"
            title="Häufige Fragen"
            description="Kompakte Antworten auf die wichtigsten Entscheidungen vor dem Start."
          />
          <div className="space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-border/60 bg-background/80 p-5"
              >
                <summary className="font-display cursor-pointer list-none text-lg font-medium">
                  {item.q}
                </summary>
                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-18">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-[linear-gradient(135deg,oklch(0.93_0.03_300),oklch(0.97_0.01_320))] px-8 py-12 text-center md:px-12 md:py-16">
          <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-chart-2/30 blur-3xl" />
          <p className="text-muted-foreground text-xs font-semibold tracking-[0.22em] uppercase">
            Ready to ship
          </p>
          <h2 className="font-display mt-3 text-3xl leading-tight font-semibold md:text-5xl">
            Bring deine Dashboard-Landschaft unter Versionskontrolle.
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-base leading-relaxed md:text-lg">
            Starte mit einem Stack, deploye ihn in Minuten und skaliere danach
            schrittweise über Teams und Environments.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="https://app.wetrack.dev/signUp"
              className="inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm font-semibold text-background"
            >
              Create free account
            </a>
            <a
              href="https://docs.wetrack.dev"
              className="inline-flex h-11 items-center rounded-full border border-border/80 bg-background/70 px-6 text-sm font-medium"
            >
              Explore docs
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 py-10">
        <div className="container flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <p>© 2026 WeTrack. Built for software teams.</p>
          <div className="flex items-center gap-5">
            <a
              href="https://docs.wetrack.dev"
              className="hover:text-foreground transition-colors"
            >
              Docs
            </a>
            <a
              href="https://github.com/loiicd/wetrack-dashboard"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://app.wetrack.dev/signUp"
              className="hover:text-foreground transition-colors"
            >
              Start free
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
