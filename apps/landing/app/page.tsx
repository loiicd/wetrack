import {
  Braces,
  ChevronRight,
  GitBranch,
  LockKeyhole,
  Sparkles,
} from "lucide-react";

import { FeatureCard } from "@/components/feature-card";
import { SectionHeading } from "@/components/section-heading";

const CODE_SAMPLE = `import { Stack, Dashboard, DataSource, Query, Chart } from "wetrack-dashboard";

export default new Stack("saas-metrics", "PRODUCTION")
  .addDashboard(new Dashboard("overview", { label: "SaaS Metrics" }))
  .addDataSource(new DataSource("api", {
    type: "rest",
    config: { url: "https://api.example.com/metrics", method: "get" }
  }))
  .addQuery(new Query("revenue", {
    type: "jsonpath", dataSource: "api", jsonPath: "$.metrics[*]"
  }))
  .addChart(new Chart("revenue-chart", {
    dashboard: "overview",
    source: { _entity: "query", key: "revenue" },
    label: "Monthly Recurring Revenue",
    type: "line",
    config: { xField: "month", valueFields: ["mrr"] }
  }));`;

const FEATURES = [
  {
    icon: <Braces className="size-5" />,
    title: "TypeScript-First",
    description:
      "Typ-sicher, IDE-Support, keine YAML-Fehler mehr. LLMs können es lesen und schreiben.",
  },
  {
    icon: <GitBranch className="size-5" />,
    title: "CI/CD-Ready",
    description:
      'Ein `git push` deployed dein Dashboard. GitHub Actions out of the box.',
  },
  {
    icon: <LockKeyhole className="size-5" />,
    title: "Credential Vault",
    description:
      "API Keys gehören nicht in den Code. WeTrack injiziert sie sicher beim Data Fetch.",
  },
  {
    icon: <Sparkles className="size-5" />,
    title: "AI-Ready",
    description:
      "LLMs schreiben TypeScript nativ. Dashboards zum ersten Mal wirklich automatisierbar.",
  },
];

const PRICING = [
  {
    name: "Free",
    price: "€0",
    cadence: "/ forever",
    items: [
      "1 Org",
      "5 Dashboards",
      "Unlimited Queries",
      "Community Support",
    ],
    cta: "Get started free",
    featured: false,
  },
  {
    name: "Pro",
    price: "€29",
    cadence: "/ Monat",
    items: [
      "Unlimited Dashboards",
      "Credential Vault",
      "Priority Support",
    ],
    cta: "Start with Pro",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "",
    items: [
      "Custom Limits",
      "SLA",
    ],
    cta: "Contact Sales",
    featured: false,
  },
];

export default function Home() {
  return (
    <main id="top" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_20%,oklch(0.79_0.11_34/.25),transparent_42%),radial-gradient(circle_at_80%_12%,oklch(0.72_0.18_280/.18),transparent_38%),radial-gradient(circle_at_50%_84%,oklch(0.58_0.14_200/.18),transparent_35%)]" />

      {/* Hero */}
      <section className="container grid gap-12 py-18 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-26">
        <div className="space-y-8">
          <div className="space-y-3">
            <p className="font-display text-4xl font-bold tracking-tight md:text-5xl">
              WeTrack
            </p>
            <h1 className="font-display text-3xl leading-[1.1] font-semibold md:text-5xl lg:text-6xl">
              Your dashboards live
              <span className="text-gradient block">in your repo.</span>
            </h1>
            <p className="text-muted-foreground max-w-md text-base leading-relaxed md:text-lg">
              TypeScript statt YAML. Versioniert, reviewbar, CI/CD-fähig.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://app.wetrack.dev/signUp"
              className="inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm font-semibold text-background transition-transform hover:scale-[1.02]"
            >
              Get started for free
              <ChevronRight className="ml-1 size-4" />
            </a>
            <a
              href="https://docs.wetrack.dev"
              className="inline-flex h-11 items-center rounded-full border border-border/80 bg-background/65 px-6 text-sm font-medium backdrop-blur transition-colors hover:bg-background"
            >
              View docs
            </a>
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
          <pre className="max-h-[30rem] overflow-auto p-5 font-mono text-xs leading-6">
            <code>{CODE_SAMPLE}</code>
          </pre>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container section-padding">
        <SectionHeading
          eyebrow="Features"
          title="Dashboard-as-Code, wie es sein sollte"
          description="Kein Click-Ops. Kein YAML. Nur TypeScript, Git und dein CI."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="section-padding border-y border-border/60 bg-card/35"
      >
        <div className="container">
          <SectionHeading
            eyebrow="Pricing"
            title="Starte kostenlos, skaliere wenn du bereit bist"
            description="Kein Kreditkarte erforderlich. Upgrade jederzeit."
            align="center"
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {PRICING.map((plan) => (
              <article
                key={plan.name}
                className={
                  plan.featured
                    ? "relative flex flex-col rounded-2xl border border-chart-2/60 bg-[linear-gradient(160deg,oklch(0.96_0.02_320),oklch(0.93_0.03_285))] p-7 shadow-xl dark:bg-[linear-gradient(160deg,oklch(0.22_0.03_285),oklch(0.18_0.02_320))]"
                    : "flex flex-col rounded-2xl border border-border/60 bg-card/65 p-7"
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
                <p className="mt-3 text-4xl font-semibold tabular-nums">
                  {plan.price}
                  {plan.cadence ? (
                    <span className="text-muted-foreground ml-1 text-base font-normal">
                      {plan.cadence}
                    </span>
                  ) : null}
                </p>
                <ul className="mt-6 grow space-y-2 text-sm">
                  {plan.items.map((item) => (
                    <li
                      key={item}
                      className="text-muted-foreground flex items-start gap-2"
                    >
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-chart-2" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href={
                    plan.name === "Enterprise"
                      ? "mailto:hello@wetrack.dev"
                      : "https://app.wetrack.dev/signUp"
                  }
                  className={
                    plan.featured
                      ? "mt-8 inline-flex h-10 w-full items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background transition-transform hover:scale-[1.02]"
                      : "mt-8 inline-flex h-10 w-full items-center justify-center rounded-full border border-border text-sm font-semibold transition-colors hover:bg-muted/50"
                  }
                >
                  {plan.cta}
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="container py-18">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-[linear-gradient(135deg,oklch(0.93_0.03_300),oklch(0.97_0.01_320))] px-8 py-12 text-center dark:bg-[linear-gradient(135deg,oklch(0.18_0.03_300),oklch(0.14_0.01_320))] md:px-12 md:py-16">
          <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-chart-2/30 blur-3xl" />
          <h2 className="font-display text-3xl leading-tight font-semibold md:text-5xl">
            Bring deine Dashboards unter Versionskontrolle.
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-base leading-relaxed md:text-lg">
            Ein Stack. Ein Push. Fertig.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="https://app.wetrack.dev/signUp"
              className="inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm font-semibold text-background transition-transform hover:scale-[1.02]"
            >
              Get started for free
              <ChevronRight className="ml-1 size-4" />
            </a>
            <a
              href="https://docs.wetrack.dev"
              className="inline-flex h-11 items-center rounded-full border border-border/80 bg-background/70 px-6 text-sm font-medium transition-colors hover:bg-background"
            >
              View docs
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 py-10">
        <div className="container flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <p>© 2026 WeTrack</p>
          <div className="flex items-center gap-5">
            <a
              href="https://docs.wetrack.dev"
              className="transition-colors hover:text-foreground"
            >
              Docs
            </a>
            <a
              href="https://github.com/loiicd/wetrack-dashboard"
              className="transition-colors hover:text-foreground"
            >
              GitHub
            </a>
            <a
              href="https://app.wetrack.dev/signUp"
              className="transition-colors hover:text-foreground"
            >
              App
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
