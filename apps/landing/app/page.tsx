import Link from "next/link";

const CODE_EXAMPLE = `import { Stack, Dashboard, DataSource, Query, Chart } from "wetrack-dashboard";

export default new Stack("saas-metrics", "PRODUCTION")
  .addDashboard(
    new Dashboard("overview", { label: "SaaS Metrics" })
  )
  .addDataSource(
    new DataSource("api", {
      type: "rest",
      config: {
        url: "https://api.example.com/metrics",
        method: "get",
        credential: "my-api-key",   // from Credential Vault
      }
    })
  )
  .addQuery(
    new Query("mrr-data", {
      type: "jsonpath",
      dataSource: "api",
      jsonPath: "$.metrics[*]",
    })
  )
  .addChart(
    new Chart("mrr-chart", {
      dashboard: "overview",
      source: { _entity: "query", key: "mrr-data" },
      label: "Monthly Recurring Revenue",
      type: "line",
      config: { xField: "month", valueFields: ["mrr"] },
      layout: { x: 0, y: 0, w: 12, h: 3 },
    })
  );`;

const FEATURES = [
  {
    icon: "⚡",
    title: "Code-first",
    description:
      "Define dashboards in TypeScript. Get version control, code review, and CI/CD for your analytics infrastructure.",
  },
  {
    icon: "🔗",
    title: "REST DataSources",
    description:
      "Connect any REST API as a data source. JSONPath and SQL transformations built in — no extra config.",
  },
  {
    icon: "📊",
    title: "4 Chart Types",
    description:
      "Bar, Line, Stat, and Clock charts — stable, fast and fully configurable from TypeScript.",
  },
  {
    icon: "🔐",
    title: "Credential Vault",
    description:
      "Store API keys encrypted in the vault. Reference by label in code — the value never touches your repo.",
  },
  {
    icon: "🏢",
    title: "Multi-tenant",
    description:
      "Organization isolation out of the box. Each team has isolated dashboards, credentials, and API keys.",
  },
  {
    icon: "🤖",
    title: "AI-ready",
    description:
      "TypeScript with full JSDoc — LLMs can write and update dashboards directly. No YAML, no drag-and-drop.",
  },
];

const PRICING = [
  {
    name: "Free",
    price: "€0",
    period: "forever",
    features: [
      "1 organization",
      "Up to 5 dashboards",
      "Unlimited queries",
      "Community support",
    ],
    cta: "Get started",
    highlight: false,
  },
  {
    name: "Pro",
    price: "€29",
    period: "per month",
    features: [
      "Unlimited dashboards",
      "Credential Vault",
      "Priority support",
      "CI/CD integrations",
    ],
    cta: "Start free trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    features: [
      "Self-hosted option",
      "SLA guarantee",
      "Dedicated support",
      "Custom integrations",
    ],
    cta: "Contact us",
    highlight: false,
  },
];

const CLI_STEPS = [
  {
    step: 1,
    cmd: "npm install wetrack-dashboard",
    comment: "# install the SDK",
  },
  {
    step: 2,
    cmd: "export WETRACK_API_KEY=<your-api-key>",
    comment: "# from app.wetrack.dev/settings/api-keys",
  },
  {
    step: 3,
    cmd: "npx wetrack-cli deploy mystack.ts",
    comment: "# ship it",
  },
];

export default function Home() {
  return (
    <main className="flex flex-col">
      {/* Hero */}
      <section className="relative mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 py-24 text-center">
        {/* subtle gradient blob */}
        <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

        <span className="relative rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
          Dashboard-as-Code · Open Beta
        </span>

        <h1 className="relative text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          Your dashboards,{" "}
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            as code
          </span>
        </h1>

        <p className="relative max-w-xl text-lg text-muted-foreground">
          Define data sources, queries, and charts in TypeScript. Deploy with
          one CLI command. Version control your analytics. No drag-and-drop, no
          YAML — just code.
        </p>

        <div className="relative flex flex-wrap justify-center gap-3">
          <Link
            href="https://app.wetrack.dev/signUp"
            className="inline-flex h-11 items-center rounded-lg bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            Get started free
          </Link>
          <Link
            href="https://docs.wetrack.dev"
            className="inline-flex h-11 items-center rounded-lg border px-7 text-sm font-medium hover:bg-muted transition-colors"
          >
            Read the docs →
          </Link>
        </div>

        {/* Code snippet */}
        <div className="relative w-full overflow-hidden rounded-xl border bg-neutral-950 text-left shadow-2xl">
          <div className="flex items-center gap-1.5 border-b border-neutral-800 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <span className="h-3 w-3 rounded-full bg-green-500/80" />
            <span className="ml-3 text-xs text-neutral-500 font-mono">mystack.ts</span>
          </div>
          <pre className="overflow-x-auto p-5 text-xs leading-6 text-neutral-300 font-mono">
            <code>{CODE_EXAMPLE}</code>
          </pre>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/20 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-3 text-center text-3xl font-bold">Everything you need</h2>
          <p className="mb-12 text-center text-muted-foreground">
            Built for developers who ship fast and care about quality.
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border bg-background p-6 hover:shadow-sm transition-shadow"
              >
                <div className="mb-3 text-2xl">{f.icon}</div>
                <h3 className="mb-2 font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLI Steps */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-3 text-3xl font-bold">From zero to dashboard in 3 steps</h2>
          <p className="mb-10 text-muted-foreground">
            Install the SDK, grab an API key, write your stack.
          </p>
          <div className="flex flex-col gap-3 text-left">
            {CLI_STEPS.map(({ step, cmd, comment }) => (
              <div
                key={step}
                className="flex items-center gap-4 rounded-lg border bg-neutral-950 px-5 py-3.5"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {step}
                </span>
                <div className="flex-1 min-w-0">
                  <code className="text-sm text-neutral-200 font-mono">{cmd}</code>
                  <span className="ml-2 text-xs text-neutral-500 font-mono">{comment}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t bg-muted/20 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-3 text-center text-3xl font-bold">Simple, transparent pricing</h2>
          <p className="mb-12 text-center text-muted-foreground">
            Start free, scale when you need to.
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-xl border p-6 ${
                  plan.highlight
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                    : "bg-background"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[11px] font-semibold text-primary-foreground">
                    Most popular
                  </span>
                )}
                <h3 className="font-semibold text-lg">{plan.name}</h3>
                <div className="my-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-sm text-muted-foreground ml-1">/ {plan.period}</span>
                  )}
                </div>
                <ul className="mb-6 flex flex-col gap-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5 text-green-500 font-bold">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="https://app.wetrack.dev/signUp"
                  className={`mt-auto inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors ${
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

      {/* CTA Banner */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Ready to put your dashboards in code?
          </h2>
          <p className="mb-8 text-muted-foreground">
            Join developers who ship dashboards with the same workflow as their
            application code.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="https://app.wetrack.dev/signUp"
              className="inline-flex h-11 items-center rounded-lg bg-primary px-7 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Start for free
            </Link>
            <Link
              href="https://docs.wetrack.dev"
              className="inline-flex h-11 items-center rounded-lg border px-7 text-sm font-medium hover:bg-muted transition-colors"
            >
              View documentation
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10 text-center text-sm text-muted-foreground">
        <p className="mb-2">© 2026 WeTrack. Built for developers.</p>
        <div className="flex justify-center gap-6">
          <Link href="https://docs.wetrack.dev" className="hover:text-foreground transition-colors">
            Docs
          </Link>
          <Link href="https://github.com/loiicd/wetrack-dashboard" className="hover:text-foreground transition-colors">
            GitHub
          </Link>
          <Link href="https://app.wetrack.dev/signUp" className="hover:text-foreground transition-colors">
            Sign up
          </Link>
        </div>
      </footer>
    </main>
  );
}
