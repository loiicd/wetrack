import Link from "next/link";
import type { Route } from "next";

const CODE_EXAMPLE = `import { Stack, Dashboard, DataSource, Query, Chart } from "dashboard_as_code";

const stack = new Stack("saas-metrics", "PRODUCTION")
  .addDashboard(new Dashboard("main", { label: "SaaS Metrics" }))
  .addDataSource(new DataSource("api", {
    type: "rest",
    config: { url: "https://api.example.com/metrics", method: "get" }
  }))
  .addQuery(new Query("mrr-data", {
    type: "jsonpath", dataSource: "api", jsonPath: "$.metrics[*]"
  }))
  .addChart(new Chart("mrr-chart", {
    dashboard: "main", query: "mrr-data",
    label: "Monthly Recurring Revenue",
    type: "line",
    config: { xField: "month", valueFields: ["mrr"] }
  }));

export default stack;`;

const FEATURES = [
  {
    icon: "⚡",
    title: "Code-first",
    description:
      "Define dashboards in TypeScript. Version control, code review and CI/CD for your analytics.",
  },
  {
    icon: "🔗",
    title: "REST DataSources",
    description:
      "Connect any REST API as a data source. JSONPath and SQL transformations built in.",
  },
  {
    icon: "📊",
    title: "4 Chart Types",
    description:
      "Bar, Line, Stat and Clock charts – stable, fast and fully configurable from code.",
  },
  {
    icon: "🔐",
    title: "Credential Vault",
    description:
      "Store API keys and secrets encrypted. Reference them from DataSources – never in plaintext.",
  },
  {
    icon: "🏢",
    title: "Multi-tenant",
    description:
      "Organizations out of the box via Clerk. Each team has isolated dashboards and credentials.",
  },
  {
    icon: "🚀",
    title: "One command deploy",
    description:
      "wetrack deploy mystack.ts — synthesize and ship your dashboard in seconds.",
  },
];

const PRICING = [
  {
    name: "Free",
    price: "€0",
    period: "forever",
    features: ["1 organization", "Up to 5 dashboards", "Unlimited queries", "Community support"],
    cta: "Get started",
    highlight: false,
  },
  {
    name: "Pro",
    price: "€29",
    period: "per month",
    features: ["Unlimited dashboards", "Credential Vault", "Priority support", "CI/CD integrations"],
    cta: "Start free trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    features: ["Self-hosted option", "SLA", "Dedicated support", "Custom integrations"],
    cta: "Contact us",
    highlight: false,
  },
];

export default function Home() {
  return (
    <main className="flex flex-col">
      {/* Hero */}
      <section className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 py-24 text-center">
        <span className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
          Dashboard-as-Code · Open Beta
        </span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Your dashboards,{" "}
          <span className="text-primary">as code</span>
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Define data sources, queries and charts in TypeScript. Deploy with one CLI command.
          No drag-and-drop. No YAML. Just code.
        </p>
        <div className="flex gap-3">
          <Link
            href="https://app.wetrack.io/signUp"
            className="inline-flex h-10 items-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Get started free
          </Link>
          <Link
            href={"/docs" as Route}
            className="inline-flex h-10 items-center rounded-lg border px-6 text-sm font-medium hover:bg-muted"
          >
            Read the docs
          </Link>
        </div>

        {/* Code snippet */}
        <div className="w-full overflow-hidden rounded-xl border bg-neutral-950 text-left shadow-xl">
          <div className="flex items-center gap-1.5 border-b border-neutral-800 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            <span className="h-3 w-3 rounded-full bg-yellow-500" />
            <span className="h-3 w-3 rounded-full bg-green-500" />
            <span className="ml-2 text-xs text-neutral-400">mystack.ts</span>
          </div>
          <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-neutral-300">
            <code>{CODE_EXAMPLE}</code>
          </pre>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Everything you need</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl border bg-background p-6">
                <div className="mb-3 text-2xl">{f.icon}</div>
                <h3 className="mb-1 font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLI section */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Deploy in 3 steps</h2>
          <p className="mb-10 text-muted-foreground">
            Install the CLI, create an API key, write your stack.
          </p>
          <div className="flex flex-col gap-3 text-left">
            {[
              "bun add -g @wetrack/cli",
              "export WETRACK_API_KEY=<your-api-key>",
              "wetrack deploy mystack.ts --url https://app.wetrack.io/api/dashboard",
            ].map((cmd, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border bg-neutral-950 px-4 py-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <code className="text-sm text-neutral-300">{cmd}</code>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-4 text-center text-3xl font-bold">Simple pricing</h2>
          <p className="mb-12 text-center text-muted-foreground">Start free, scale when you need.</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`flex flex-col rounded-xl border p-6 ${
                  plan.highlight ? "border-primary bg-primary/5 shadow-lg" : "bg-background"
                }`}
              >
                <h3 className="font-semibold">{plan.name}</h3>
                <div className="my-3">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-sm text-muted-foreground"> / {plan.period}</span>
                  )}
                </div>
                <ul className="mb-6 flex flex-col gap-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <span className="text-green-500">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="https://app.wetrack.io/signUp"
                  className={`mt-auto inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium ${
                    plan.highlight
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border hover:bg-muted"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} WeTrack. Built with Next.js & Clerk.</p>
      </footer>
    </main>
  );
}
